"use client";
import { SearchIcon } from "lucide-react";
import { FC } from "react";

interface SearchButtonProps {}

const SearchButton: FC<SearchButtonProps> = ({}) => {
    // this is a button, this will open search container
  return (
    <div>
      <div className="w-fit md:w-full py-2 px-4 md:px-6 text-muted-foreground flex justify-between items-center rounded-2xl border-border bg-background/80 hover:bg-background/50 group transition-all duration-300 cursor-pointer md:cursor-text">
        <p className="hidden md:block md:text-lg">Search producs</p>
        <SearchIcon className="w-6 h-6 md:w-7 md:h-7 group-hover:text-accent-foreground cursor-pointer duration-300" />
      </div>
    </div>
  );
};

export default SearchButton;
