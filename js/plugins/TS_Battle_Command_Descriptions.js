/*:
 * // Also targets MV! This is just to turn off the warning in MZ.
 * @target MZ
 *
 * @orderAfter YEP_BattleEngineCore
 *
 * // This is a bit of a guess.
 * @orderAfter VisuMZ_1_BattleCore
 *
 * @pluginname Battle Command Descriptions
 * @plugindesc (Ver. 1.0.0) Shows customisable help text for battle commands.
 * @url https://tamschi.itch.io/battle-command-descriptions
 *
 * @author Tamschi (tamschi.itch.io)
 *
 * @param battleCommandDescriptions
 * @text Battle Command Descriptions...
 * @desc Choose any combination of Party and Actor commands and Skill types. The first match is used.
 * @type struct<BattleCommandDescription>[]
 * @default []
 *
 * @param spacer_1_
 * @text -
 * @type string
 *
 * @param compatibilityTweaks
 * @text Compatibility tweaks?
 * @desc Tweaks to other plugins' functions for a smoother experience. (Recommended, and doesn't require them.)
 * @type boolean
 * @default true
 *
 * @param compatibilityTweakReduceClears
 * @text (YEP BEC) Reduce clears?
 * @desc Prevents the help window from being erroneously cleared in some circumstances.
 * @type boolean
 * @default true
 * @parent compatibilityTweaks
 *
 * @help
 *
 * With this plugin, the help window that normally appears for Skills and Items
 * is also shown for Party and Actor commands (i.e. the category selection).
 *
 * You can assign help text to any commands (including custom commands) and
 * skill types (by ID). The 'attack' and 'guard' commands use the inputting
 * Actor's respective Skill's Description by default.
 *
 * =====
 * Ideas
 * =====
 *
 * You can use this plugin to show full versions of abbreviated command names,
 * and/or to add some flavour text to them.
 *
 * =====
 * Hints
 * =====
 *
 * The help window supports most escape codes.
 *
 * If you use a plugin to choose attack and guard skills for individual actors,
 * that choice will be reflected in the default help texts for those commands.
 *
 * ==========
 * Load Order
 * ==========
 *
 * As all hooks installed by Battle Command Descriptions are transparent, it
 * shouldn't interfere with other plugins' features.
 *
 * When in doubt, load Battle Command Descriptions relatively late.
 *
 * =================
 * Plugin Parameters
 * =================
 *
 * ------------------------------
 * Battle Command Descriptions...
 * ------------------------------
 *
 * Use this parameter to set up help text used for Party and Actor commands in
 * battle. Each help text can be used for any combination and number of them.
 *
 * You can also choose a specific skill type or a set of them, to use more
 * specific texts than what the "skill" Actor command alone would enable.
 *
 * ---------------------
 * Compatibility tweaks?
 * ---------------------
 *
 * Iff enabled (as group and individually), Battler Entrance Flipbooks will
 * adjust other plugins' features to avoid glitches.
 *
 * See the individual parameters for more information.
 *
 * Each tweak only applies if its targets are detected when this plugin is
 * first loaded, and does nothing otherwise, so they are enabled by default.
 *
 * ===============
 * Plugin Commands
 * ===============
 *
 * This plugin does not define any Plugin Commands.
 *
 * ==============
 * JavaScript API
 * ==============
 *
 * This plugin unconditionally sets the global variable
 * `TS_Battle_Command_Descriptions` when first loaded.
 *
 * There, the following property and functions are available:
 * (See source code comments for more detailed type information.)
 *
 * -------
 * version
 * -------
 *
 * Semantic Version-compatible `featureLevel` and `patchLevel` information.
 *
 * I don't reset the `patchLevel` to 0 when incrementing `featureLevel`, so
 * that `patchLevel` alone is enough to determine whether a certain fix is
 * available in each version.
 *
 * This property is frozen and the object is frozen.
 *
 * ----------
 * parameters
 * ----------
 *
 * Parsed plugin parameters, with `__`-suffixes removed from property keys.
 * Missing arrays and strings are added as empty, here, and Boolean properties
 * are normalised to `true` or `false`.
 *
 * This property is frozen, but the object is mutable.
 *
 * ------------------------
 * BattleCommandDescription
 * ------------------------
 *
 * Class that parses and evaluates structural plugin parameters. It's possible
 * for other plugins to extend this class to create more advanced behaviour
 * programmatically. Please refer to the source code for more information.
 *
 * This property is frozen, but the class is mutable.
 *
 * -------------------  -------------------
 * oldCreateAllWindows, newCreateAllWindows
 * -------------------  -------------------
 *
 * Functions associated with the `Scene_Battle` hook installed by this plugin.
 * The hook uses a small "trampoline" that calls the "new…" function, so you
 * can skip the hook very precisely using another plugin if necessary.
 *
 * This hook calls `setHelpWindow` on `this._partyCommandWindow` and
 * `this._actorCommandWindow`.
 *
 * --------------------------------  --------------------------------
 * oldWindow_PartyCommandUpdateHelp, oldWindow_ActorCommandUpdateHelp,
 * --------------------------------  --------------------------------
 * newWindow_PartyCommandUpdateHelp, newWindow_ActorCommandUpdateHelp
 * --------------------------------  --------------------------------
 *
 * Functions associated with `updateHelp` hooks installed by this plugin.
 * The hooks use a small "trampoline" that calls the "new…" function, so you
 * can skip the hook very precisely using another plugin if necessary.
 *
 * ---------------------------  ---------------------------
 * oldWindow_PartyCommandClose, oldWindow_ActorCommandClose,
 * ---------------------------  ---------------------------
 * newWindow_PartyCommandClose, newWindow_ActorCommandClose
 * ---------------------------  ---------------------------
 *
 * Functions associated with `close` hooks installed by this plugin.
 * The hooks use a small "trampoline" that calls the "new…" function, so you
 * can skip the hook very precisely using another plugin if necessary.
 *
 * ----------
 * updateHelp(commandWindow, commandData)
 * ----------
 *
 * Updates the `commandWindow`'s help window. The `commandData` is that
 * returned by `Window_Command.prototype.currentData`.
 *
 * -------------------
 * getPartyCommandHelp(commandData): string | null
 * -------------------
 *
 * Determines the help text for Party commands iff available.
 *
 * ----------------
 * getActorCommandHelp(commandData): string | null
 * ----------------
 *
 * Determines the help text for Actor commands iff available.
 *
 * =============
 * Save Contents
 * =============
 *
 * This plugin does not store any additional save data.
 *
 * ===================
 * Compatibility Notes
 * ===================
 *
 * This plugin was tested on RPG Maker MV 1.6.3 and RPG Maker MZ 1.8.0, uses
 * only the public RPG Maker API as far as possible, and does not use any
 * platform-specific APIs.
 *
 * This plugin installs only transparent hooks that cannot interfere with other
 * plugins' functions, barring collisions of the help window assignment. A
 * later-loaded plugin can be used to assign different help windows to the
 * battle command windows.
 *
 * This plugin should be compatible with any deployment target available for
 * RPG Maker MV and MZ, including web and most custom ones.
 *
 * This plugin is compatible with YEP_BattleEngineCore (tested with v1.51),
 * as long as the matching compatibility tweak is enabled in this plugin.
 *
 * This plugin *appears* to be fully compatible with VisuMZ_1_BattleCore
 * (tested with Version 1.80). Note that when using VisuMZ_1_BattleCore, the
 * "escape" command is an actor command by default!
 * Please note that due to VisuMZ_* plugins' obfuscation, compatibility support
 * by me for these plugins specifically is only available as paid commission.
 *
 * If you notice issues or glitches in combination with other plugins, please
 * tell me about them, and I'll check if a compatibility tweak is feasible.
 *
 * =======
 * Support
 * =======
 *
 * Please don't hesitate to contact me with any issues you encounter (including
 * inconveniences) or if anything is unclear about the plugin!
 *
 * You can find up-to-date contact information at
 * https://itch.io/blog/480852/tamschis-support-contact-information-inquiries .
 *
 * =============
 * License Grant
 * =============
 *
 * A license for this plugin can be purchased at
 * https://tamschi.itch.io/battle-command-descriptions .
 *
 * Once you have purchased it, you may redistribute and sublicense this plugin
 * file as part of games you create. You may not redistribute nor sublicense it
 * separately or as part of an asset- or resource-collection.
 *
 * You may modify this plugin when including it with your games, as long as the
 * attribution above and this license grant stay intact. If you do so, you must
 * add comments to indicate which changes you made from the original.
 *
 * =========
 * Changelog
 * =========
 *
 * -------------
 * Version 1.0.0
 * -------------
 *
 * 2024-01-25
 *
 * Initial release.
 */

/*~struct~BattleCommandDescription:
 *
 * @param note
 * @text Note:
 * @desc For your convenience. (Does nothing.)
 * @type note
 *
 * @param partyCommandSymbols__
 * @text Party Commands:
 * @desc Internal Party command identifiers for which to display this description text.
 * @type combo[]
 * @option fight
 * @option escape
 *
 * @param actorCommandSymbols__
 * @text Actor Commands:
 * @desc Internal Actor command identifiers for which to display this description text.
 * @type combo[]
 * @option attack
 * @option skill
 * @option guard
 * @option item
 *
 * @param skillTypeIds
 * @text Skill Types:
 * @desc IDs of Skill types to show the description text for. Use with or without 'skill' Actor command.
 * @type number[]
 * @default []
 *
 * @param description
 * @text Description:
 * @desc Help text to show. Supports escape codes like Item and Skill descriptions.
 * @type note
 */

'use strict';

try {
	class TS_Battle_Command_Descriptions__Error extends Error {
		get name() {
			return this.constructor.name;
		}
	}
	class TS_Battle_Command_Descriptions__PropertyValueError extends TS_Battle_Command_Descriptions__Error {
		constructor(instance, key, value) {
			console.error("TS_Battle_Command_Descriptions PropertyValueError: instance:", instance, "key:", key, "value:", value);
			super(`Tried to assign invalid value to field ${key} of ${instance.constructor.name}: ${value}`);
		}
	}

	const TS_BATTLE_COMMAND_HELP = 'TS_Battle_Command_Descriptions';

	class BattleCommandDescription {
		constructor(decodedParameterObject) {
			try {
				this.initialize(decodedParameterObject);
			} catch (error) {
				const prefix = `An error occurred while setting up ${this.constructor.name} with note: "${this.note}"`;
				console.warn(prefix);
				error.message = prefix + "<br>" + error.message;
				throw error;
			}
		}

		/** @param {Record<string | symbol, any>} dpo decodedParameterObject */
		initialize(dpo) {
			this.note = dpo.note || "";

			this.partyCommandSymbols = dpo.partyCommandSymbols || [];
			this.actorCommandSymbols = dpo.actorCommandSymbols || [];
			this.skillTypeIds = dpo.skillTypeIds || [];
			this.description = dpo.description || '';
		}

		/** @returns {string} */
		get note() { return this._note; }
		set note(note) {
			if (typeof note !== 'string') {
				throw new TS_Battle_Command_Descriptions__PropertyValueError(this, 'note', note);
			}
			this._note = note;
		}

		/** @returns {string[]} */
		get partyCommandSymbols() { return this._partyCommandSymbols; }
		set partyCommandSymbols(partyCommandSymbols) {
			if (!(partyCommandSymbols instanceof Array) || !partyCommandSymbols.every(x => typeof x === 'string')) {
				throw new TS_Battle_Command_Descriptions__PropertyValueError(this, 'partyCommandSymbols', partyCommandSymbols);
			}
			this._partyCommandSymbols = partyCommandSymbols;
		}

		/** @returns {string[]} */
		get actorCommandSymbols() { return this._actorCommandSymbols; }
		set actorCommandSymbols(actorCommandSymbols) {
			if (!(actorCommandSymbols instanceof Array) || !actorCommandSymbols.every(x => typeof x === 'string')) {
				throw new TS_Battle_Command_Descriptions__PropertyValueError(this, 'actorCommandSymbols', actorCommandSymbols);
			}
			this._actorCommandSymbols = actorCommandSymbols;
		}

		/** @returns {number[]} */
		get skillTypeIds() { return this._skillTypeIds; }
		set skillTypeIds(skillTypeIds) {
			if (!(skillTypeIds instanceof Array) || !skillTypeIds.every(x => typeof x === 'number')) {
				throw new TS_Battle_Command_Descriptions__PropertyValueError(this, 'skillTypeIds', skillTypeIds);
			}
			this._skillTypeIds = skillTypeIds;
		}

		/** @returns {string} */
		get description() { return this._description; }
		set description(description) {
			if (typeof description !== 'string') {
				throw new TS_Battle_Command_Descriptions__PropertyValueError(this, 'description', description);
			}
			this._description = description;
		}

		/** @returns {string | null} */
		forPartyCommand({ name, symbol, enabled, ext }) {
			if (this.partyCommandSymbols.includes(symbol)) {
				return this.description;
			} else return null;
		}

		/** @returns {string | null} */
		forActorCommand({ name, symbol, enabled, ext }) {
			switch (symbol) {
				case 'skill':
					if (this.skillTypeIds.includes(ext)) {
						return this.description;
					} else if (this.skillTypeIds.length > 0) {
						break;
					} else {
						// Fallthrough.
					}

				default:
					if (this.actorCommandSymbols.includes(symbol)) {
						return this.description;
					}
			}
			return null;
		}
	}

	const parameters = PluginManager.parameters(TS_BATTLE_COMMAND_HELP);
	void function decodeParameters(parameterObject) {
		if (typeof parameterObject !== "object" || parameterObject === null) {
			return;
		}

		for (const key of Object.getOwnPropertyNames(parameterObject)) {
			if (key.endsWith("__")) {
				const stringArray = parameterObject[key] ? JSON.parse(parameterObject[key]) : [];
				parameterObject[key.slice(0, -2)] = stringArray;
				delete parameterObject[key];
				for (let i = 0; i < stringArray.length; i++) {
					stringArray[i] = stringArray[i].trim();
				}
			} else if (key.endsWith("_")) {
				parameterObject[key.slice(0, -1)] = parameterObject[key].trim();
				delete parameterObject[key];
			} else if (typeof parameterObject[key] === 'string') {
				if (parameterObject[key].trim() === "") {
					parameterObject[key] = null;
				} else {
					parameterObject[key] = JSON.parse(parameterObject[key]);

					decodeParameters(parameterObject[key]);
				}
			}
		}
	}(parameters);

	// Normalise parameters:
	parameters.battleCommandDescriptions = (parameters.battleCommandDescriptions || []).map(dpo => new BattleCommandDescription(dpo));
	parameters.compatibilityTweaks = !!parameters.compatibilityTweaks;
	parameters.compatibilityTweakReduceClears = !!parameters.compatibilityTweakReduceClears;

	// API

	const api = {
		/** The version of this plugin. */
		version: {
			/** Incremented with feature additions. */
			featureLevel: 0,
			/** Incremented with internal changes that don't add features. */
			patchLevel: 0,
		},

		parameters,

		BattleCommandDescription,

		oldCreateAllWindows: Scene_Battle.prototype.createAllWindows,
		...(Scene_Battle.prototype.createAllWindows = function () { return api.newCreateAllWindows.apply(this, arguments); }, {}),
		newCreateAllWindows: function () {
			const result = api.oldCreateAllWindows.apply(this, arguments);
			this._partyCommandWindow.setHelpWindow(this._helpWindow);
			this._actorCommandWindow.setHelpWindow(this._helpWindow);
			return result;
		},

		oldWindow_PartyCommandUpdateHelp: Window_PartyCommand.prototype.updateHelp,
		...(Window_PartyCommand.prototype.updateHelp = function () { return api.newWindow_PartyCommandUpdateHelp.apply(this, arguments); }, {}),
		newWindow_PartyCommandUpdateHelp() {
			const result = api.oldWindow_PartyCommandUpdateHelp.apply(this, arguments);
			this.showHelpWindow();
			api.updateHelp(this, this.currentData());
			return result;
		},

		oldWindow_PartyCommandClose: Window_PartyCommand.prototype.close,
		...(Window_PartyCommand.prototype.close = function () { return api.newWindow_PartyCommandClose.apply(this, arguments); }, {}),
		newWindow_PartyCommandClose() {
			this.hideHelpWindow();
			return api.oldWindow_PartyCommandClose.apply(this, arguments);
		},

		oldWindow_ActorCommandUpdateHelp: Window_ActorCommand.prototype.updateHelp,
		...(Window_ActorCommand.prototype.updateHelp = function () { return api.newWindow_ActorCommandUpdateHelp.apply(this, arguments); }, {}),
		newWindow_ActorCommandUpdateHelp() {
			const result = api.oldWindow_ActorCommandUpdateHelp.apply(this, arguments);
			this.showHelpWindow();
			api.updateHelp(this, this.currentData());
			return result;
		},

		oldWindow_ActorCommandClose: Window_ActorCommand.prototype.close,
		...(Window_ActorCommand.prototype.close = function () { return api.newWindow_ActorCommandClose.apply(this, arguments); }, {}),
		newWindow_ActorCommandClose() {
			this.hideHelpWindow();
			return api.oldWindow_ActorCommandClose.apply(this, arguments);
		},

		updateHelp(commandWindow, commandData) {
			let help;
			if (commandWindow instanceof Window_PartyCommand) {
				help = commandData ? api.getPartyCommandHelp(commandData) || "" : "";
			} else if (commandWindow instanceof Window_ActorCommand) {
				help = commandData ? api.getActorCommandHelp(commandData) || "" : "";
			}
			commandWindow._helpWindow.setText(help);
		},

		/** @returns {string | null} */
		getPartyCommandHelp(commandData) {
			if (!commandData) return null;

			/** @type {BattleCommandDescription} */
			let commandDescription;
			for (commandDescription of parameters.battleCommandDescriptions) {
				const help = commandDescription.forPartyCommand(commandData);
				if (typeof help === 'string') return help;
			}

			return null;
		},

		/** @returns {string | null} */
		getActorCommandHelp(commandData) {
			if (!commandData) return null;

			/** @type {BattleCommandDescription} */
			let commandDescription;
			for (commandDescription of parameters.battleCommandDescriptions) {
				const help = commandDescription.forActorCommand(commandData);
				if (typeof help === 'string') return help;
			}

			switch (commandData.symbol) {
				case 'attack': {
					const action = BattleManager.inputtingAction();
					const actor = action && action.subject();
					const object = actor && $dataSkills[actor.attackSkillId()];
					const help = object.description;
					if (typeof help === 'string') return help;
				} break;

				case 'guard': {
					const action = BattleManager.inputtingAction();
					const actor = action && action.subject();
					const object = actor && $dataSkills[actor.guardSkillId()];
					const help = object.description;
					if (typeof help === 'string') return help;
				} break;

				default: break;
			}

			return null;
		}
	};

	Object.freeze(api.version);

	Object.defineProperties(api, {
		version: { configurable: false, writable: false },
		parameters: { configurable: false, writable: false },
		BattleCommandDescription: { configurable: false, writable: false },
	});

	window[TS_BATTLE_COMMAND_HELP] = api;

	if (parameters.compatibilityTweaks) {
		if (parameters.compatibilityTweakReduceClears && window.Yanfly && Yanfly.BEC) {
			// BEC clears the help window quite aggressively.
			// Some of that must be skipped to ensure proper function.

			let reduction = 0;

			const oldClear = Window_Help.prototype.clear;
			Window_Help.prototype.clear = function () {
				if (reduction) {
					reduction -= 1;
				} else return oldClear.apply(this, arguments);
			};

			const oldSelectNextCommand = Yanfly.BEC.Scene_Battle_selectNextCommand;
			Yanfly.BEC.Scene_Battle_selectNextCommand = function () {
				const result = oldSelectNextCommand.apply(this, arguments);
				reduction = 1;
				return result;
			};
		}
	}

} catch (error) {
	/**
	 * Raises `error` in a way that causes the game to display it.
	 * Errors thrown during plugin initialisation are normally discarded
	 * silently instead.
	*/
	void function raising() {
		if (!SceneManager._scene) {
			setTimeout(raising, 1000);
		} else {
			SceneManager.catchException(error);
		}
	}();
	throw error;
}
