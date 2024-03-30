import { FC } from "react";
import Logo from "./logo";
import HamburgerMenu from "./hamburger-menu";
import SearchButton from "./search-button";
import AuthButton from "./auth-button";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  return (
    <div className="h-16 md:h-20 w-full bg-background/95">
      <div className="h-full w-full py-2 px-4 flex items-center justify-between">
        {/* hamburger menu button */}
        <div className="flex gap-2 items-center">
          <HamburgerMenu />
          {/* logo */}
          <Logo />
        </div>
        {/* seach input box */}
        <div className="max-w-[50%] flex-grow  flex justify-end md:block">
          <SearchButton />
        </div>
        {/* menus and avatar */}
        <div className="hidden md:block">
          <AuthButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
