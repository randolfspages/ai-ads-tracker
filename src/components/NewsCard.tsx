import { NewsItem } from "@/types/news";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard = ({ item }: NewsCardProps) => {
  return (
    <div className="border p-4 shadow-sm">
      <Link href={`/news/${item.id}`}>
        <Image
          src={'/banner.png'}
          alt={item?.name}
          width={500}
          height={500}
          className="mb-5 md:h-56 rounded hover:scale-105 cursor-pointer transition-all duration-300"
        />
      </Link>
      <div>
        <h2 className="text-xl font-semibold my-3">{item?.name.substring(0, 65)}</h2>
        <p className="mb-4">{item?.email.substring(0, 85)}...</p>
        <Link href={`/news/${item.id}`}>
          <Button className="">Read More</Button>
        </Link>
      </div>
    </div>
  );
};

export default NewsCard;
