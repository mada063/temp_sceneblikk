import Divider from "@/components/Divider";
import Bulletpoints from "./Bulletpoints";
import Byggeblokker from "./Byggeblokker";
import ForskjelligeOppsett from "./ForskjelligeOppsett";
import Landing from "./Landing";
import Starte from "./Starte";

const HomeContent = () => {
  return (
    <div>
      <Landing/>
      <ForskjelligeOppsett/>
      <Divider />
      <Byggeblokker />
      <Bulletpoints />  
      <Starte />
    </div>
  );
};

export default HomeContent;

