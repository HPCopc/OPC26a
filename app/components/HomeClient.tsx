"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import GrayCard from "@/app/components/MainGrayCard";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const cardData = [
  { title: "Shale Oil", description: "shale oil" },
  // ... rest of your cardData
];

export default function HomeClient() {
  const pairs = [];
  for (let i = 0; i < cardData.length; i += 2) {
    pairs.push(cardData.slice(i, i + 2));
  }

  return (
    <>
      <div>
        {pairs.map((pair, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4">
            {pair.map((item, i) => (
              <GrayCard key={`${idx}-${i}`} title={item.title} description={item.description} />
            ))}
          </div>
        ))}
      </div>
      <div>this is ad</div>
    </>
  );
}