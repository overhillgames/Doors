//=============================================================================
// OG_EventSpriteFX.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0.1] Automatic, page-aware sprite blend mode & opacity for map events.
 * @author Overhill Games
 *
 * @param EnableWarnings
 * @text Enable Playtest Warnings
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Warn in the console during playtest about invalid tag values.
 * @default true
 *
 * @help OG_EventSpriteFX.js
 * =============================================================================
 * Overview
 * =============================================================================
 * This plugin lets a map event's sprite automatically use a specific blend
 * mode (Normal, Add, Multiply, or Screen) and/or a specific opacity level,
 * controlled entirely through notetags and comments. No movement routes, no
 * plugin commands, no manual per-page setup beyond adding a tag.
 *
 * Blend mode and opacity are independent of each other - use either one,
 * both, or neither on any given event/page.
 *
 * RPG Maker MZ renders through PixiJS 5 over WebGL. WebGL only reliably
 * supports four blend modes: Normal, Add, Multiply, and Screen. PixiJS 5
 * exposes many additional PIXI.BLEND_MODES constants (values 4-29), but its
 * own documentation notes these are not reliably supported under WebGL and
 * may silently render as Normal. This plugin therefore only officially
 * supports the four listed above.
 *
 * =============================================================================
 * How To Use
 * =============================================================================
 * There are two places you can put a tag:
 *
 * 1) The event's Note field (top-left of the event editor window).
 *    A tag here applies to every page of the event, unless a page below
 *    overrides it with its own Comment tag.
 *
 * 2) A Comment event command on a specific page.
 *    A tag here applies ONLY while that page is the event's active page,
 *    and overrides whatever the event's Note field says.
 *
 * Blend Mode - copy-paste examples (Note field or Comment command):
 *
 *   Normal
 *   <BlendMode: NORMAL>
 *
 *   Add
 *   <BlendMode: ADD>
 *
 *   Multiply
 *   <BlendMode: MULTIPLY>
 *
 *   Screen
 *   <BlendMode: SCREEN>
 *
 *   Reset a specific page to Normal (Comment tag only; overrides the
 *   event's Note field for as long as this page is active)
 *   <BlendMode: DEFAULT>
 *
 * <BlendMode: RESET> works identically to <BlendMode: DEFAULT>. Numeric
 * forms are also accepted: <BlendMode: 0> (Normal), <BlendMode: 1> (Add),
 * <BlendMode: 2> (Multiply), <BlendMode: 3> (Screen).
 *
 * Opacity - copy-paste examples (Note field or Comment command):
 *
 *   Half transparent
 *   <Opacity: 128>
 *
 *   Fully invisible (still active/triggerable, just not drawn)
 *   <Opacity: 0>
 *
 *   Fully opaque
 *   <Opacity: 255>
 *
 *   Reset a specific page to full opacity (Comment tag only; overrides the
 *   event's Note field for as long as this page is active)
 *   <Opacity: DEFAULT>
 *
 * <Opacity: RESET> works identically to <Opacity: DEFAULT>. Opacity accepts
 * whole numbers from 0 (invisible) to 255 (fully opaque), matching RPG
 * Maker's native opacity range.
 *
 * All tag values are case-insensitive: <blendmode:add> and <opacity:128>
 * work the same as <BlendMode: ADD> and <Opacity: 128>.
 *
 * =============================================================================
 * Priority
 * =============================================================================
 * Blend mode and opacity are resolved independently, each using this order:
 * 1. A tag on the event's currently active page Comment.
 * 2. A tag in the event's Note field.
 * 3. The default (Normal blend mode / 255 opacity), if neither is present.
 *
 * Examples:
 *   - Note field says <BlendMode: MULTIPLY>, active page has no BlendMode
 *     tag: the event uses Multiply.
 *   - Note field says <BlendMode: MULTIPLY>, active page has
 *     <BlendMode: ADD>: the event uses Add.
 *   - Note field says <BlendMode: MULTIPLY>, active page has
 *     <BlendMode: DEFAULT>: the event uses Normal.
 *   - Note field says <Opacity: 100>, active page has no Opacity tag: the
 *     event renders at opacity 100, regardless of what its BlendMode
 *     resolves to.
 *   - No tags anywhere: Normal blend mode, full opacity.
 *
 * =============================================================================
 * Suggested Uses
 * =============================================================================
 *   - MULTIPLY is well suited to shadow sprites: a dark, semi-transparent
 *     graphic set to Multiply will visibly darken the map beneath it,
 *     rather than looking like a flat translucent gray shape.
 *   - ADD and SCREEN are useful for light sources, glows, fire, and
 *     magical/energy effects.
 *   - NORMAL restores ordinary, unblended rendering.
 *   - Only NORMAL, ADD, MULTIPLY, and SCREEN are officially supported for
 *     blend mode. Any other value falls back to Normal (see below).
 *   - Low Opacity values are useful for ghosts, illusions, water
 *     reflections, or events that should fade into the background.
 *
 * =============================================================================
 * Invalid Values
 * =============================================================================
 * A misspelled or out-of-range value (e.g. <BlendMode: OVERLAY>,
 * <BlendMode: 28>, or <Opacity: 400>) never crashes the game. It safely
 * falls back to the default for that property (Normal / 255).
 *
 * During playtest, with the "Enable Playtest Warnings" parameter on, the
 * first time an invalid value is encountered for a given event/page/source/
 * property it prints one console warning naming the Map ID, Event ID,
 * property, and the invalid value. It will not spam the same warning every
 * frame. Set the parameter to false to silently fall back with no console
 * output. Neither setting affects a deployed/production build's behavior
 * beyond logging.
 *
 * =============================================================================
 * Refresh Behavior
 * =============================================================================
 * Blend mode and opacity are recalculated and reapplied to the event when:
 *   - The event is initialized.
 *   - The map loads (new map or map transfer).
 *   - The event changes pages.
 *   - The event refreshes (e.g. after a self-switch or parallel change).
 *   - The event's character graphic changes.
 *   - A saved game is loaded onto the map.
 *
 * Internally this plugin calls the event's own native setBlendMode() and
 * setOpacity() methods (the same ones RPG Maker's "Change Opacity" and
 * "Change Blend Mode" move-route steps use), so the sprite picks the values
 * up through the engine's normal per-frame sync.
 *
 * IMPORTANT - This plugin is strictly opt-in, per property, per event:
 * if an event/page has no BlendMode tag anywhere (Note field or active
 * page Comment), this plugin will never call setBlendMode() on it at all -
 * it leaves that event's blend mode completely alone. The same is true for
 * Opacity. This means events that manage their own opacity or blend mode
 * by hand (e.g. a flicker/fade effect built from "Change Opacity" /
 * "Change Blend Mode" steps in a Set Movement Route) are left untouched by
 * this plugin as long as they don't also carry the corresponding tag.
 *
 * Only once a tag is present does this plugin take ownership of that one
 * property on that event, reapplying it at every refresh point below - so
 * a move-route step that changes a *tagged* property mid-page will be
 * overwritten again the next time this plugin re-resolves it (page change,
 * refresh, etc.). That's expected: the tag is meant to be the source of
 * truth once you add it. Don't tag a property you intend to keep driving
 * yourself via move routes or other plugins.
 *
 * The player, followers, and vehicles are never affected by this plugin.
 *
 * =============================================================================
 * Compatibility
 * =============================================================================
 * This plugin does not require Galv's Layer Graphics or any other plugin.
 * It only aliases a small number of engine methods (never overwrites them
 * outright) and should coexist with VisuStella's Core Engine and Events and
 * Movement Core, and with Galv's Character Frames, Character Animations,
 * and Layer Graphics plugins. If you do encounter an ordering conflict,
 * try placing this plugin below the major VisuStella Core plugins in the
 * Plugin Manager list.
 *
 * =============================================================================
 * Terms of Use
 * =============================================================================
 * Free to use and modify for this project.
 *
 * =============================================================================
 * Version History
 * =============================================================================
 * v1.0.0 - Initial release. Combines and supersedes the earlier
 *          OG_EventBlendModes.js, adding independent per-event/per-page
 *          Opacity tag support alongside BlendMode.
 * v1.0.1 - Fixed: the plugin no longer forces blend mode/opacity back to
 *          Normal/255 on events that don't carry the corresponding tag.
 *          Previously, any map-wide refresh (e.g. triggered by a self
 *          switch changing anywhere on the map) would reset every
 *          untagged event's blend mode and opacity, fighting any Move
 *          Route "Change Opacity"/"Change Blend Mode" steps those events
 *          used on their own. The plugin now only touches a property on
 *          an event once that event actually declares a tag for it.
 */

(() => {
    "use strict";

    const PLUGIN_NAME = "OG_EventSpriteFX";
    const params = PluginManager.parameters(PLUGIN_NAME);
    const ENABLE_WARNINGS = params.EnableWarnings !== "false";

    //-------------------------------------------------------------------------
    // Blend Mode parsing
    //-------------------------------------------------------------------------

    const BLEND_NAME_TO_MODE = {
        NORMAL: PIXI.BLEND_MODES.NORMAL,
        ADD: PIXI.BLEND_MODES.ADD,
        MULTIPLY: PIXI.BLEND_MODES.MULTIPLY,
        SCREEN: PIXI.BLEND_MODES.SCREEN
    };

    const BLEND_NUMBER_TO_MODE = {
        0: PIXI.BLEND_MODES.NORMAL,
        1: PIXI.BLEND_MODES.ADD,
        2: PIXI.BLEND_MODES.MULTIPLY,
        3: PIXI.BLEND_MODES.SCREEN
    };

    const BLEND_TAG_REGEX = /<blendmode\s*:\s*([^>]*)>/i;

    function parseBlendValue(rawValue) {
        const trimmed = String(rawValue).trim();
        const upper = trimmed.toUpperCase();
        if (upper === "DEFAULT" || upper === "RESET") {
            return { valid: true, value: PIXI.BLEND_MODES.NORMAL };
        }
        if (Object.prototype.hasOwnProperty.call(BLEND_NAME_TO_MODE, upper)) {
            return { valid: true, value: BLEND_NAME_TO_MODE[upper] };
        }
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            if (Object.prototype.hasOwnProperty.call(BLEND_NUMBER_TO_MODE, num)) {
                return { valid: true, value: BLEND_NUMBER_TO_MODE[num] };
            }
        }
        return { valid: false, value: PIXI.BLEND_MODES.NORMAL };
    }

    //-------------------------------------------------------------------------
    // Opacity parsing
    //-------------------------------------------------------------------------

    const OPACITY_TAG_REGEX = /<opacity\s*:\s*([^>]*)>/i;
    const OPACITY_DEFAULT = 255;

    function parseOpacityValue(rawValue) {
        const trimmed = String(rawValue).trim();
        const upper = trimmed.toUpperCase();
        if (upper === "DEFAULT" || upper === "RESET") {
            return { valid: true, value: OPACITY_DEFAULT };
        }
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            if (num >= 0 && num <= 255) {
                return { valid: true, value: num };
            }
        }
        return { valid: false, value: OPACITY_DEFAULT };
    }

    //-------------------------------------------------------------------------
    // Shared tag lookup / warning helpers
    //-------------------------------------------------------------------------

    // Concatenates a page's Comment (108) and continuation (408) command
    // text into one searchable string, or "" if the page has none.
    function getPageCommentText(page) {
        if (!page || !Array.isArray(page.list)) {
            return "";
        }
        let text = "";
        for (const command of page.list) {
            if (command && (command.code === 108 || command.code === 408)) {
                text += command.parameters[0] + "\n";
            }
        }
        return text;
    }

    function firstMatch(text, regex) {
        if (!text) {
            return null;
        }
        const match = regex.exec(text);
        return match ? match[1] : null;
    }

    const warnedKeys = new Set();

    function warnInvalidValue(mapId, eventId, property, source, rawValue) {
        if (!ENABLE_WARNINGS || !$gameTemp.isPlaytest()) {
            return;
        }
        const key = `${mapId}:${eventId}:${property}:${source}:${rawValue}`;
        if (warnedKeys.has(key)) {
            return;
        }
        warnedKeys.add(key);
        console.warn(
            `${PLUGIN_NAME}: Invalid <${property}: ${rawValue}> (${source}) on ` +
            `Map ${mapId}, Event ${eventId}. Falling back to default.`
        );
    }

    // Resolves a single tagged property (BlendMode or Opacity) using the
    // shared priority rules: active-page Comment tag, then event Note tag.
    // Returns { applies: false } when neither is present, meaning this
    // plugin should not touch that property on that event at all - it's
    // being managed by something else (a Move Route, another plugin, etc).
    function resolveTaggedProperty(gameEvent, dataEvent, commentText, regex, parseFn, propertyLabel, defaultValue) {
        const pageRaw = firstMatch(commentText, regex);
        if (pageRaw !== null) {
            const parsed = parseFn(pageRaw);
            if (parsed.valid) {
                return { applies: true, value: parsed.value };
            }
            warnInvalidValue(gameEvent._mapId, gameEvent._eventId, propertyLabel, "page comment", pageRaw);
            return { applies: true, value: defaultValue };
        }
        const noteRaw = firstMatch(dataEvent.note, regex);
        if (noteRaw !== null) {
            const parsed = parseFn(noteRaw);
            if (parsed.valid) {
                return { applies: true, value: parsed.value };
            }
            warnInvalidValue(gameEvent._mapId, gameEvent._eventId, propertyLabel, "event note", noteRaw);
            return { applies: true, value: defaultValue };
        }
        return { applies: false, value: defaultValue };
    }

    //-------------------------------------------------------------------------
    // Game_Event
    //-------------------------------------------------------------------------

    // Recomputes BlendMode and Opacity from tags and applies them through
    // the character's own native setBlendMode()/setOpacity() setters, which
    // the engine's existing Sprite_Character#updateOther already syncs to
    // the sprite every frame. Strictly opt-in: a property is only touched
    // on this event if a tag for it actually exists (page Comment or Note).
    // Events with no tags at all are left completely alone, so hand-driven
    // Move Route opacity/blend effects on untagged events are never fought.
    Game_Event.prototype.ogRefreshSpriteFX = function() {
        const dataEvent = this.event();
        if (!dataEvent || this._pageIndex < 0) {
            return;
        }

        const page = dataEvent.pages[this._pageIndex];
        const commentText = getPageCommentText(page);

        const blendMode = resolveTaggedProperty(
            this, dataEvent, commentText, BLEND_TAG_REGEX, parseBlendValue,
            "BlendMode", PIXI.BLEND_MODES.NORMAL
        );
        if (blendMode.applies) {
            this.setBlendMode(blendMode.value);
        }

        const opacity = resolveTaggedProperty(
            this, dataEvent, commentText, OPACITY_TAG_REGEX, parseOpacityValue,
            "Opacity", OPACITY_DEFAULT
        );
        if (opacity.applies) {
            this.setOpacity(opacity.value);
        }
    };

    const _OG_GameEvent_refresh = Game_Event.prototype.refresh;
    Game_Event.prototype.refresh = function() {
        _OG_GameEvent_refresh.call(this);
        this.ogRefreshSpriteFX();
    };

    //-------------------------------------------------------------------------
    // Game_CharacterBase - catch explicit graphic changes (e.g. via a
    // "Change Image" move route command) on events specifically.
    //-------------------------------------------------------------------------

    const _OG_GameCharacterBase_setImage = Game_CharacterBase.prototype.setImage;
    Game_CharacterBase.prototype.setImage = function(characterName, characterIndex) {
        _OG_GameCharacterBase_setImage.call(this, characterName, characterIndex);
        if (this instanceof Game_Event) {
            this.ogRefreshSpriteFX();
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Map - guarantee correctness right after a map loads, including
    // when a saved game is loaded onto the map.
    //-------------------------------------------------------------------------

    const _OG_SceneMap_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _OG_SceneMap_onMapLoaded.call(this);
        if ($gameMap) {
            for (const event of $gameMap.events()) {
                event.ogRefreshSpriteFX();
            }
        }
    };
})();
