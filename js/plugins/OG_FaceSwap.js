/*:
 * @target MZ
 * @plugindesc [v1.02] Replaces face graphics at runtime when matching switches are ON.
 * @author Overhill Games
 *
 * @param Face Swaps
 * @text Face Swaps
 * @type struct<FaceSwap>[]
 * @default []
 * @desc Configure one or more switch-based face graphic replacements.
 *
 * @help
 * ============================================================================
 * OG_FaceSwap
 * Version 1.02
 * ============================================================================
 *
 * This plugin replaces face graphics at runtime when a specified switch is ON.
 *
 * It affects Show Text commands that use the configured original face file.
 * You do not need to edit every Show Text command manually.
 *
 * ============================================================================
 * How It Works
 * ============================================================================
 *
 * Each Face Swap entry has:
 *
 *   Switch ID
 *   Original Face
 *   Replacement Face
 *   Face Index
 *
 * When the Switch ID is ON, any matching Show Text command using Original Face
 * will display Replacement Face instead.
 *
 * ============================================================================
 * Face Index Settings
 * ============================================================================
 *
 * The Face Index setting determines which face slot should be swapped.
 *
 * Use ALL to swap every face in the Original Face file.
 * Use 0-7 to swap only one specific face slot.
 *
 * If Face Index is left blank, the plugin treats it as ALL.
 *
 * Example:
 *
 *   Original Face: Actor1
 *   Replacement Face: Actor1_NoArmor
 *   Face Index: 7
 *
 * Result:
 *
 *   Only Actor1 face index 7 will be replaced.
 *   Actor1 face indexes 0-6 will be ignored and will display normally.
 *
 * ============================================================================
 * Face Index Explanation
 * ============================================================================
 *
 * RPG Maker MZ face graphics use one image file divided into 8 face slots.
 *
 * The slots are arranged like this:
 *
 *   0 1 2 3
 *   4 5 6 7
 *
 * If the original character is in the bottom-right slot, that is index 7.
 *
 * By default, the replacement uses the same face index as the original.
 *
 * For example, if a Show Text command uses:
 *
 *   Face file: Actor1
 *   Face index: 7
 *
 * and this plugin swaps Actor1 with Actor1_NoArmor, the displayed face becomes:
 *
 *   Face file: Actor1_NoArmor
 *   Face index: 7
 *
 * This means your replacement face file should usually place the replacement
 * portrait in the same slot as the original.
 *
 * ============================================================================
 * Example Uses
 * ============================================================================
 *
 * - Armored / unarmored portraits
 * - Hood up / hood down portraits
 * - Injured / healthy portraits
 * - Possessed / normal portraits
 * - Wet / dry portraits
 * - Corrupted / purified portraits
 * - Day / night portraits
 * - Disguised / undisguised portraits
 *
 * ============================================================================
 * Notes
 * ============================================================================
 *
 * - Put all face files in img/faces/.
 * - Do not include ".png" in the parameter value.
 * - Replacement files should usually match the same 4x2 face layout.
 * - If multiple swaps could apply to the same original face and index, the
 *   first active matching entry in the Face Swaps list is used.
 */

/*~struct~FaceSwap:
 * @param Switch ID
 * @text Switch ID
 * @type switch
 * @default 1
 * @desc When this switch is ON, this face swap becomes active.
 *
 * @param Original Face
 * @text Original Face
 * @type file
 * @dir img/faces/
 * @default Actor1
 * @desc choose the file where the original face image is found
 *
 * @param Replacement Face
 * @text Replacement Face
 * @type file
 * @dir img/faces/
 * @default Actor1_NoArmor
 * @desc choose the file where the replacement face image is found
 *
 * @param Face Index
 * @text Face Index
 * @type combo
 * @option ALL
 * @option 0
 * @option 1
 * @option 2
 * @option 3
 * @option 4
 * @option 5
 * @option 6
 * @option 7
 * @default ALL
 * @desc Choose ALL to swap every face in the file, or choose 0-7 to swap only that face slot. Blank is treated as ALL.
 */

(() => {
  "use strict";

  const pluginName = "OG_FaceSwap";
  const params = PluginManager.parameters(pluginName);

  function parseJson(value, fallback) {
    try {
      return JSON.parse(value || "");
    } catch (e) {
      return fallback;
    }
  }

  function parseFaceIndex(value) {
    const text = String(value ?? "").trim().toUpperCase();

    if (!text || text === "ALL") {
      return null;
    }

    const index = Number(text);

    if (Number.isInteger(index) && index >= 0 && index <= 7) {
      return index;
    }

    return null;
  }

  const rawSwaps = parseJson(params["Face Swaps"], []);

  const faceSwaps = rawSwaps
    .map(entry => parseJson(entry, null))
    .filter(entry => entry)
    .map(entry => ({
      switchId: Number(entry["Switch ID"] || 0),
      originalFace: String(entry["Original Face"] || ""),
      replacementFace: String(entry["Replacement Face"] || ""),
      faceIndex: parseFaceIndex(entry["Face Index"])
    }))
    .filter(entry =>
      entry.switchId > 0 &&
      entry.originalFace &&
      entry.replacementFace
    );

  function matchesFaceIndex(entry, faceIndex) {
    return entry.faceIndex === null || entry.faceIndex === faceIndex;
  }

  const _Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;

  Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
    const swap = faceSwaps.find(entry =>
      $gameSwitches.value(entry.switchId) &&
      faceName === entry.originalFace &&
      matchesFaceIndex(entry, faceIndex)
    );

    if (swap) {
      faceName = swap.replacementFace;
    }

    _Game_Message_setFaceImage.call(this, faceName, faceIndex);
  };
})();
