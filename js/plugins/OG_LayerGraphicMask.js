/*:
 * @target MZ
 * @plugindesc [v1.00] Masks Galv Layer Graphics layers to a stencil shape so they stop rendering over specific map areas (e.g. keep drifting cloud shadows off a "hole" that reveals a background sky layer).
 * @author Overhill Games
 * @base GALV_LayerGraphicsMZ
 * @orderAfter GALV_LayerGraphicsMZ
 *
 * @param Shadow Masks
 * @text Shadow Masks
 * @type struct<ShadowMask>[]
 * @default []
 * @desc Each entry masks one Galv Layer Graphics layer on one map with a stencil image.
 *
 * @param Debug Show Masks
 * @text Debug Show Masks
 * @type boolean
 * @default false
 * @desc ON: shows each mask stencil semi-transparent and un-masks the target layer, for lining up art. Turn OFF before shipping.
 *
 * @help
 * ============================================================================
 * OG_LayerGraphicMask
 * Version 1.00
 * ============================================================================
 *
 * Galv's Layer Graphics MZ (GALV_LayerGraphicsMZ.js) gives every layer a
 * "Z Level" that controls draw ORDER (what's on top of what), but that Z
 * value applies uniformly across the whole screen. A layer like a tiling
 * cloud-shadow graphic has no concept of "only show over these tiles" - it
 * either renders everywhere at that Z, or nowhere.
 *
 * This plugin adds real spatial masking on top of Galv's layers: you supply
 * a stencil image whose ALPHA channel defines where a target layer is
 * allowed to show. Opaque areas of the stencil = the layer renders normally.
 * Transparent areas of the stencil = the layer is hidden there, regardless
 * of its Z Level, opacity, or blend mode.
 *
 * This does NOT replace Galv's plugin. It requires GALV_LayerGraphicsMZ to
 * be installed and MUST be placed below it in the Plugin Manager list.
 *
 * ============================================================================
 * Why We Made This Shiz
 * ============================================================================
 *
 * Typical use case: a map has a "hole" in the ground tile layer that reveals
 * a distant background sky through negative Z Level parallax layers. A
 * separate pair of drifting cloud-shadow layers (positive/high Z, Multiply
 * blend) is meant to darken the foreground ground - but because those
 * shadow layers are full-screen tiling sprites, they also darken the sky
 * showing through the hole, which looks wrong (distant sky shouldn't get a
 * foreground cloud shadow cast on it).
 *
 * Painting the hole's shape directly into the shadow graphic doesn't work
 * if the shadow layer drifts (xSpeed/ySpeed != 0), since the baked-in hole
 * would slide out of alignment over time. This plugin masks the shadow
 * layer against a stencil that stays pinned to the map, independent of how
 * fast the shadow texture itself drifts.
 *
 * ============================================================================
 * Setting Up A Mask
 * ============================================================================
 *
 * 1. Create the stencil image and put it in /img/layers/ (same folder Galv
 *    uses). Make it opaque (any color, alpha 255) wherever the target layer
 *    SHOULD show, and fully transparent (alpha 0) wherever it should NOT.
 *    Soft/antialiased edges in the alpha channel are fine and will blend.
 *
 * 2. The stencil is placed in MAP PIXEL coordinates, top-left anchored,
 *    and scrolls with the camera exactly like a Galv Static Layer does. It
 *    does not move on its own - it just needs to line up with the shape of
 *    the hole (or whatever area) once, in map space.
 *
 * 3. Add an entry to the "Shadow Masks" parameter:
 *      Map ID        - the map this mask applies to
 *      Layer ID      - the Galv Layer Graphics layer ID (from the map's
 *                      LAYER/LAYER_S note tag, or the create/createStatic
 *                      plugin command) that should be masked
 *      Mask Graphic  - the stencil file in img/layers/ (no extension)
 *      X / Y         - map pixel position of the stencil's top-left corner
 *
 * 4. Turn on "Debug Show Masks" while lining things up. This displays the
 *    stencil at 50% opacity ON TOP of everything and temporarily removes
 *    the mask from the target layer, so you can see both the stencil and
 *    the unmasked layer at once and adjust X/Y or repaint the stencil until
 *    they match. Turn it back OFF when you're done - it is a calibration
 *    aid only, not something to ship with.
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *
 * - A masked layer is looked up by Layer ID each time Galv (re)builds map
 *   layers, so this works whether the layer came from a map note tag, a
 *   "Create Layer" / "Create Static Layer" plugin command, or a "Refresh
 *   Layer" call - as long as the Layer ID matches.
 * - If the target Layer ID doesn't exist yet on the current map, that mask
 *   entry is simply skipped (no error) until a matching layer appears.
 * - Plugin parameters are read once at startup - toggling "Debug Show
 *   Masks" requires restarting test play.
 * ============================================================================
 */

/*~struct~ShadowMask:
 * @param Map ID
 * @text Map ID
 * @type number
 * @min 1
 * @default 1
 * @desc The map this mask applies to.
 *
 * @param Layer ID
 * @text Layer ID
 * @type number
 * @min 0
 * @default 0
 * @desc The Galv Layer Graphics layer ID (on that map) to mask.
 *
 * @param Mask Graphic
 * @text Mask Graphic
 * @type file
 * @dir img/layers/
 * @default
 * @desc Stencil image in img/layers/. Opaque = layer shows, transparent = layer hidden.
 *
 * @param X
 * @text X
 * @type number
 * @default 0
 * @desc Map pixel X position of the stencil's top-left corner.
 *
 * @param Y
 * @text Y
 * @type number
 * @default 0
 * @desc Map pixel Y position of the stencil's top-left corner.
 */

(() => {
  "use strict";

  const pluginName = "OG_LayerGraphicMask";
  const params = PluginManager.parameters(pluginName);

  function parseJson(value, fallback) {
    try {
      return JSON.parse(value || "");
    } catch (e) {
      return fallback;
    }
  }

  const debugShowMasks = params["Debug Show Masks"] === "true";

  const rawMasks = parseJson(params["Shadow Masks"], []);

  const shadowMasks = rawMasks
    .map(entry => parseJson(entry, null))
    .filter(entry => entry)
    .map(entry => ({
      mapId: Number(entry["Map ID"] || 0),
      layerId: Number(entry["Layer ID"] || 0),
      graphic: String(entry["Mask Graphic"] || ""),
      x: Number(entry["X"] || 0),
      y: Number(entry["Y"] || 0)
    }))
    .filter(entry => entry.mapId > 0 && entry.graphic);

  //---------------------------------------------------------------------
  // Spriteset_Map - build/refresh mask sprites whenever Galv (re)builds
  // its layer graphics, and keep them pinned to the map each frame.
  //---------------------------------------------------------------------

  const _Spriteset_Map_createLayerGraphics = Spriteset_Map.prototype.createLayerGraphics;
  Spriteset_Map.prototype.createLayerGraphics = function() {
    _Spriteset_Map_createLayerGraphics.call(this);
    this.ogRefreshShadowMasks();
  };

  Spriteset_Map.prototype.ogRefreshShadowMasks = function() {
    this._ogShadowMasks = this._ogShadowMasks || {};

    const mapId = $gameMap.mapId();
    const configs = shadowMasks.filter(cfg => cfg.mapId === mapId);
    const activeKeys = [];

    for (const cfg of configs) {
      const key = cfg.mapId + "_" + cfg.layerId;
      activeKeys.push(key);

      const targetSprite = this.layerGraphics && this.layerGraphics[cfg.layerId];
      if (!targetSprite) continue; // layer doesn't exist (yet) on this map

      let mask = this._ogShadowMasks[key];
      if (!mask) {
        mask = new Sprite(ImageManager.loadLayerGraphic(cfg.graphic));
        mask.anchor.x = 0;
        mask.anchor.y = 0;
        mask.z = 0;
        mask.ogConfig = cfg;
        mask.renderable = debugShowMasks; // stays in the tree either way so its transform still updates
        if (debugShowMasks) mask.opacity = 128;
        this._tilemap.addChild(mask);
        this._ogShadowMasks[key] = mask;
      }

      targetSprite.mask = debugShowMasks ? null : mask;
    }

    // Drop masks whose map/layer is no longer active
    for (const key in this._ogShadowMasks) {
      if (!activeKeys.includes(key)) {
        this._tilemap.removeChild(this._ogShadowMasks[key]);
        delete this._ogShadowMasks[key];
      }
    }
  };

  const _Spriteset_Map_update = Spriteset_Map.prototype.update;
  Spriteset_Map.prototype.update = function() {
    _Spriteset_Map_update.call(this);
    this.ogUpdateShadowMasks();
  };

  Spriteset_Map.prototype.ogUpdateShadowMasks = function() {
    if (!this._ogShadowMasks) return;
    const tileSize = $gameMap.tileWidth();
    for (const key in this._ogShadowMasks) {
      const mask = this._ogShadowMasks[key];
      const cfg = mask.ogConfig;
      mask.x = cfg.x - $gameMap.displayX() * tileSize;
      mask.y = cfg.y - $gameMap.displayY() * tileSize;
    }
  };
})();
