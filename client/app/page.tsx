import PageLayout from "@/components/global/PageLayout";
import HomePage from "@/components/pages/home-page";
import { FC } from "react";

interface HomeProps {}

const Home: FC<HomeProps> = ({}) => {
  return (
    <PageLayout sidebar navbar>
        <HomePage />
    </PageLayout>
  );
};

export default Home;
