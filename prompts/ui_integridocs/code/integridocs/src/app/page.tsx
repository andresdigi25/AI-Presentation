"use client";

import Image from "next/image";
import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

export default function Home() {
  const [searchText, setSearchText] = React.useState("");
  const [isSearching, setSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [textResult, setTextResult] = React.useState("");

  const handleSearch = async () => {
    setTextResult("");
    setShowResults(false);
    try {
      setSearching(true);
      const res = await fetch("http://localhost:5678/webhook/doc-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchText }),
      });
      const result = await res.json();
      setTextResult(result.output);
      setShowResults(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start md:w-xl">
        <h1 className="text-5xl animate-bounce animate-once animate-duration-1000 animate-ease-in-out animate-alternate-reverse animate-fill-both">
          Qa Platform IA Docs
        </h1>
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          type="text"
          className="animate-ping animate-once animate-duration-1000 animate-ease-in-out animate-alternate-reverse animate-fill-both rounded-md p-3 w-full border-1 border-blue dark:!border-white"
          placeholder="Search Info | Topic | Course"
          onKeyUp={(event) => {
            console.log(event.key);
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto disabled:bg-gray-700 disabled:hover:bg-gray-700"
            onClick={handleSearch}
            disabled={isSearching}
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Chat with your documents
          </button>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://xwyiatry5y.us-east-1.awsapprunner.com/guides/explanation/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>

        <div>
          {isSearching ? (
            <div role="status" className="max-w-sm animate-pulse w-[500px]">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>{showResults && <MarkdownRenderer markdown={textResult} />}</>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
