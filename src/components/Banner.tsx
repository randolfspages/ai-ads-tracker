import Image from "next/image";

import bannerImg from "@/assets/banner.png";
import { Button } from "./ui/button";

const Banner = () => {
  return (
    <section className=" dark:bg-slate-800 dark:text-white bg-gray-100 w-full">
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-4 py-4">
        <div className="w-full">
          <Image
            src={bannerImg}
            alt="Picture of the author"
            placeholder="blur"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* content */}
        <div className="flex flex-col space-y-3">
          <h4 className="text-sm font-medium text-gray-500">Technology</h4>
          <h2 className="text-3xl font-bold ">
            OpenAI Is Growing Fast and Burning Through Piles of Money
          </h2>
          <p>
            OpenAI monthly revenue hit US$300 million in August, up 1,700% since
            the beginning of 2023, and the company expects about $3.7 billion in
            annual sales this year, according to financial documents reviewed by
            The New York Times. 
            <br /> <br />
            OpenAI estimates that its revenue will balloon
            to copy1.6 billion next year. OpenAI revenue in August more than ...
          </p>

          <Button variant="default">Read More</Button>
        </div>
      </div>
    </section>
  );
};

export default Banner;
