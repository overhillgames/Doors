//=============================================================================
// OG_EventBlendModes.js
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0.0] Automatic, page-aware sprite blend modes for map events.
 * @author Overhill Games
 *
 * @param EnableWarnings
 * @text Enable Playtest Warnings
 * @type boolean
 * @on Enable
 * @off Disable
 * @desc Warn in the console during playtest about invalid <BlendMode> tags.
 * @default true
 *
 * @help OG_EventBlendModes.js
 * =============================================================================
 * Overview
 * =============================================================================
 * This plugin lets a map event's sprite automatically use a specific blend
 * mode (Normal, Add, Multiply, or Screen), controlled entirely through
 * notetags and comments. No movement routes, no plugin commands, no manual
 * per-page setup beyond adding a tag.
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
 * Copy-paste examples (use in either the Note field or a Comment command):
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
 * <BlendMode: RESET> works identically to <BlendMode: DEFAULT>.
 *
 * Numeric forms are also accepted: <BlendMode: 0> (Normal), <BlendMode: 1>
 * (Add), <BlendMode: 2> (Multiply), <BlendMode: 3> (Screen).
 *
 * All tag values are case-insensitive: <blendmode:add> works the same as
 * <BlendMode: ADD>.
 *
 * =============================================================================
 * Priority
 * =============================================================================
 * 1. A <BlendMode:...> Comment tag on the event's currently active page.
 * 2. A <BlendMode:...> notetag in the event's Note field.
 * 3. Normal, if neither of the above is present.
 *
 * Examples:
 *   - Note field says <BlendMode: MULTIPLY>, active page has no tag:
 *     the event uses Multiply.
 *   - Note field says <BlendMode: MULTIPLY>, active page has
 *     <BlendMode: ADD>: the event uses Add.
 *   - Note field says <BlendMode: MULTIPLY>, active page has
 *     <BlendMode: DEFAULT>: the event uses Normal.
 *   - No tags anywhere: the event uses Normal.
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
 *   - Only NORMAL, ADD, MULTIPLY, and SCREEN are officially supported.
 *     Any other value falls back to Normal (see below).
 *
 * =============================================================================
 * Invalid Values
 * =============================================================================
 * A misspelled or unsupported value (e.g. <BlendMode: OVERLAY> or
 * <BlendMode: 28>) never crashes the game. It safely falls back to Normal.
 *
 * During playtest, with the "Enable Playtest Warnings" parameter on, the
 * first time an invalid value is encountered for a given event/page/source
 * it prints one console warning naming the Map ID, Event ID, and the
 * invalid value. It will not spam the same warning every frame. Set the
 * parameter to false to silently fall back with no console output. Neither
 * setting affects a deployed/production build's behavior beyond logging.
 *
 * =============================================================================
 * Refresh Behavior
 * =============================================================================
 * The blend mode is recalculated and reapplied to the event's sprite when:
 *   - The event is initialized.
 *   - The map loads (new map or map transfer).
 *   - The event changes pages.
 *   - The event refreshes (e.g. after a self-switch or parallel change).
 *   - The event's character graphic changes.
 *   - A saved game is loaded onto the map.
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
 * v1.0.0 - Initial release.
 */

(() => {
    "use strict";

    const PLUGIN_NAME = "OG_EventBlendModes";
    const params = PluginManager.parameters(PLUGIN_NAME);
    const ENABLE_WARNINGS = params.EnableWarnings !== "false";

    //-------------------------------------------------------------------------
    // Blend mode resolution helpers
    //-------------------------------------------------------------------------

    const NAME_TO_MODE = {
        NORMAL: PIXI.BLEND_MODES.NORMAL,
        ADD: PIXI.BLEND_MODES.ADD,
        MULTIPLY: PIXI.BLEND_MODES.MULTIPLY,
        SCREEN: PIXI.BLEND_MODES.SCREEN
    };

    const NUMBER_TO_MODE = {
        0: PIXI.BLEND_MODES.NORMAL,
        1: PIXI.BLEND_MODES.ADD,
        2: PIXI.BLEND_MODES.MULTIPLY,
        3: PIXI.BLEND_MODES.SCREEN
    };

    const TAG_REGEX = /<blendmode\s*:\s*([^>]*)>/i;

    // Parses a raw tag value string into { valid, isReset, mode }.
    function parseBlendValue(rawValue) {
        const trimmed = String(rawValue).trim();
        const upper = trimmed.toUpperCase();
        if (upper === "DEFAULT" || upper === "RESET") {
            return { valid: true, isReset: true, mode: PIXI.BLEND_MODES.NORMAL };
        }
        if (Object.prototype.hasOwnProperty.call(NAME_TO_MODE, upper)) {
            return { valid: true, isReset: false, mode: NAME_TO_MODE[upper] };
        }
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            if (Object.prototype.hasOwnProperty.call(NUMBER_TO_MODE, num)) {
                return { valid: true, isReset: false, mode: NUMBER_TO_MODE[num] };
            }
        }
        return { valid: false, isReset: false, mode: PIXI.BLEND_MODES.NORMAL };
    }

    // Finds the raw <BlendMode:...> value in an event's Note field, or null.
    function findNoteTagValue(dataEvent) {
        if (!dataEvent || !dataEvent.note) {
            return null;
        }
        const match = TAG_REGEX.exec(dataEvent.note);
        return match ? match[1] : null;
    }

    // Finds the raw <BlendMode:...> value among a page's Comment commands,
    // or null if the page has none. Comment (108) and its continuation
    // lines (408) are concatenated before searching.
    function findPageTagValue(page) {
        if (!page || !Array.isArray(page.list)) {
            return null;
        }
        let text = "";
        for (const command of page.list) {
            if (command && (command.code === 108 || command.code === 408)) {
                text += command.parameters[0] + "\n";
            }
        }
        if (!text) {
            return null;
        }
        const match = TAG_REGEX.exec(text);
        return match ? match[1] : null;
    }

    const warnedKeys = new Set();

    function warnInvalidBlendMode(mapId, eventId, source, rawValue) {
        if (!ENABLE_WARNINGS || !$gameTemp.isPlaytest()) {
            return;
        }
        const key = mapId + ":" + eventId + ":" + source + ":" + rawValue;
        if (warnedKeys.has(key)) {
            return;
        }
        warnedKeys.add(key);
        console.warn(
            `${PLUGIN_NAME}: Invalid <BlendMode: ${rawValue}> (${source}) on ` +
            `Map ${mapId}, Event ${eventId}. Falling back to Normal.`
        );
    }

    //-------------------------------------------------------------------------
    // Game_Event
    //-------------------------------------------------------------------------

    // Computes and caches the resolved PIXI blend mode for this event's
    // currently active page, applying the priority rules:
    //   1. Active-page Comment tag
    //   2. Event Note-field notetag
    //   3. Normal
    Game_Event.prototype.ogRefreshBlendMode = function() {
        this._ogBlendMode = this.ogResolveBlendMode();
    };

    Game_Event.prototype.ogResolveBlendMode = function() {
        const dataEvent = this.event();
        if (!dataEvent || this._pageIndex < 0) {
            return PIXI.BLEND_MODES.NORMAL;
        }

        const page = dataEvent.pages[this._pageIndex];
        const pageRaw = findPageTagValue(page);
        if (pageRaw !== null) {
            const parsed = parseBlendValue(pageRaw);
            if (parsed.valid) {
                return parsed.mode;
            }
            warnInvalidBlendMode(this._mapId, this._eventId, "page comment", pageRaw);
            return PIXI.BLEND_MODES.NORMAL;
        }

        const noteRaw = findNoteTagValue(dataEvent);
        if (noteRaw !== null) {
            const parsed = parseBlendValue(noteRaw);
            if (parsed.valid) {
                return parsed.mode;
            }
            warnInvalidBlendMode(this._mapId, this._eventId, "event note", noteRaw);
            return PIXI.BLEND_MODES.NORMAL;
        }

        return PIXI.BLEND_MODES.NORMAL;
    };

    // Public getter used by Sprite_Character. Lazily resolves if the cache
    // hasn't been populated yet (e.g. an older save file predating this
    // plugin).
    Game_Event.prototype.ogBlendMode = function() {
        if (this._ogBlendMode === undefined) {
            this.ogRefreshBlendMode();
        }
        return this._ogBlendMode;
    };

    const _OG_GameEvent_refresh = Game_Event.prototype.refresh;
    Game_Event.prototype.refresh = function() {
        _OG_GameEvent_refresh.call(this);
        this.ogRefreshBlendMode();
    };

    //-------------------------------------------------------------------------
    // Game_CharacterBase - catch explicit graphic changes (e.g. via a
    // "Change Image" move route command) on events specifically.
    //-------------------------------------------------------------------------

    const _OG_GameCharacterBase_setImage = Game_CharacterBase.prototype.setImage;
    Game_CharacterBase.prototype.setImage = function(characterName, characterIndex) {
        _OG_GameCharacterBase_setImage.call(this, characterName, characterIndex);
        if (this instanceof Game_Event) {
            this.ogRefreshBlendMode();
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
                event.ogRefreshBlendMode();
            }
        }
    };

    //-------------------------------------------------------------------------
    // Sprite_Character - apply the resolved blend mode to the actual sprite.
    // Player, followers, and vehicles are untouched since they are not
    // instances of Game_Event.
    //-------------------------------------------------------------------------

    const _OG_SpriteCharacter_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function() {
        _OG_SpriteCharacter_update.call(this);
        if (this._character instanceof Game_Event) {
            const mode = this._character.ogBlendMode();
            if (this.blendMode !== mode) {
                this.blendMode = mode;
            }
        }
    };
})();
