/*:
 * @target MZ
 * @plugindesc [v1.01] Replaces face graphics at runtime when matching switches are ON.
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
 * Version 1.01
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
 *
 * When the Switch ID is ON, any Show Text command using Original Face will
 * display Replacement Face instead.
 *
 * The face index is preserved.
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
 * If the original character is in the bottom-right slot, that is index 7.
 * The replacement version should also be in the bottom-right slot.
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
 * - If multiple swaps could apply to the same original face, the first active
 *   matching entry in the Face Swaps list is used.
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

  const rawSwaps = parseJson(params["Face Swaps"], []);

  const faceSwaps = rawSwaps
    .map(entry => parseJson(entry, null))
    .filter(entry => entry)
    .map(entry => ({
      switchId: Number(entry["Switch ID"] || 0),
      originalFace: String(entry["Original Face"] || ""),
      replacementFace: String(entry["Replacement Face"] || "")
    }))
    .filter(entry =>
      entry.switchId > 0 &&
      entry.originalFace &&
      entry.replacementFace
    );

  const _Game_Message_setFaceImage = Game_Message.prototype.setFaceImage;

  Game_Message.prototype.setFaceImage = function(faceName, faceIndex) {
    const swap = faceSwaps.find(entry =>
      $gameSwitches.value(entry.switchId) &&
      faceName === entry.originalFace
    );

    if (swap) {
      faceName = swap.replacementFace;
    }

    _Game_Message_setFaceImage.call(this, faceName, faceIndex);
  };
})();
