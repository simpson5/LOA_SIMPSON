import type { CharacterChecklist } from "~/utils/storage";

interface CharacterCardProps {
  character: CharacterChecklist;
  onToggleGold?: (name: string) => void;
}

export function CharacterCard({ character, onToggleGold }: CharacterCardProps) {
  const levelColor = getLevelColor(character.itemLevel);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-lg">{character.characterName}</h3>
          <p className="text-gray-400 text-sm">{character.className}</p>
        </div>
        <div className="text-right">
          <p className={`font-bold ${levelColor}`}>
            {character.itemLevel.toFixed(2)}
          </p>
          {onToggleGold && (
            <button
              onClick={() => onToggleGold(character.characterName)}
              className={`text-xs px-2 py-1 rounded mt-1 ${
                character.isGoldCharacter
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {character.isGoldCharacter ? "골드 캐릭" : "미지정"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getLevelColor(level: number): string {
  if (level >= 1680) return "text-red-400";
  if (level >= 1660) return "text-orange-400";
  if (level >= 1640) return "text-yellow-400";
  if (level >= 1620) return "text-purple-400";
  return "text-blue-400";
}
