import Banner from "@/components/Banner";
import NewsCard from "@/components/NewsCard";
import NewsLetter from "@/components/NewsLetter";
import { NewsItem } from "@/types/news";

export default async function Home() {
  const respones = await fetch(`https://jsonplaceholder.typicode.com/users`);
  const news = await respones.json();
  return (
    <div className="w-full mx-auto px-4 py-12">
     <Banner/>

     <div className="my-12">
      <h2 className="text-2xl font-bold mb-8">Latest News</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 justify-between">
        {
          news.slice(0, 3).map((item: NewsItem) => (
            <NewsCard key={item.id} item={item}/>
          ))
        }
      </div>
     </div>

     <NewsLetter/>
    </div>
  );
}

