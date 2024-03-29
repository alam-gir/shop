import ThemeSwitcher from "@/components/global/theme-switcher";
import { FC } from "react";

interface HomeProps {}

const Home: FC<HomeProps> = ({}) => {
  return (
    <div className="h-full w-full bg-white dark:bg-black">
      <ThemeSwitcher />
      <div className="bg-background text-foreground">
        <p className="text-primary">This is a primary text.</p>
        <p className="text-secondary">This is a secondary text.</p>
        <p className="text-muted">This is a muted text.</p>
        <p className="text-accent">This is an accent text.</p>
        <p className="text-accent-purple">This is an accent purple text.</p>
        <p className="text-destructive">This is a destructive text.</p>
        <p className="text-success">This is a success text.</p>
        <p className="text-warning">This is a warning text.</p>
        <p className="text-info">This is an info text.</p>
        <p className="text-disabled">This is a disabled text.</p>
        <p className="text-hover">This is a hover text.</p>
        <p className="text-focus">This is a focus text.</p>
      </div>
    </div>
  );
};

export default Home;
