import { FC } from "react";
import { Button } from "../ui/button";
import { MenuIcon } from "lucide-react";

interface HamburgerMenuProps {}

const HamburgerMenu: FC<HamburgerMenuProps> = ({}) => {
  return <Button size="icon" variant={"ghost"}>
    <MenuIcon className="h-6 w-6 text-primary" />
  </Button>;
};

export default HamburgerMenu;
