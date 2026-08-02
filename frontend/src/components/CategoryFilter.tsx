interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 flex items-center gap-2">
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl transition-all border tracking-wide uppercase ${
              isActive
                ? "bg-[#2d4029] text-white border-[#2d4029] shadow-sm"
                : "bg-white text-[#2d4029] border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
