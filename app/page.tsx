"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
// import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import GrayCard from "@/app/components/MainGrayCard";

Amplify.configure(outputs);

const client = generateClient<Schema>();

const cardData = [
  { title: "Shale Oil", description: "shale oil" },
  { title: "Leveraging AI and ML to Navigate Crude Market Uncertainty:", description: "aiml"},
  { title: "Crude Analyzer Innovations: Cutting-Edge Solutions", description: "crudeanalyzer" },
  { title: "Crude Oil & Biofeed Management", description: "crudeoil" },
  { title: "Opportunity Crudes Conference since 2008", description: "opc2008" },
  { title: "Unlock Insights from Our Recent Opportunity Crudes Conference on Crude Flexibility to Meet the Energy TrilemmaCrude Oil & Biofeed", description: "Unlock" },
  { title: "Markets", description: "market" },
  { title: "Opportunity Crudes", description: "OPC" },
];

const xcardData = [
  { title: "Predictive Operations", description: "Leverage ML-driven virtual assays to foresee handling challenges before they impact your margins." },
  { title: "Strategic Processing", description: "Use AI to identify the most cost-effective pathways and blending recipes for complex crude slates." },
  { title: "Proactive Resilience", description: "Transition from reactive troubleshooting to closed-loop, ML-driven optimization." },
  { title: "Partner With Us", description: "Showcase your thought leadership in the digital oilfield and connect with refinery professionals." },
  { title: "MODCON SYSTEMS", description: "Next‑generation process analyzers for oil refining, natural gas, chemical and energy industries." },
  { title: "Crude Oil & Biofeed", description: "Key insights from industry leaders on optimizing refineries for the energy trilemma." },
  { title: "Conference Proceedings", description: "Purchase the PDF proceedings from our exclusive October 2024 event." },
  { title: "Energy Trilemma", description: "Insights on balancing security, affordability, and sustainability in crude operations." },
];

export default function App() {
   
// Fetch content directly in Server Component
//  const content = await getAllContent();
  
  // Group content into 4 sets of 2 (8 items total)
 // const contentPairs = [
 //   content.slice(0, 2), // Set 1
 //   content.slice(2, 4), // Set 2
 //   content.slice(4, 6), // Set 3
 //   content.slice(6, 8)  // Set 4
 // ];

  const pairs = [];
  for (let i = 0; i < cardData.length; i += 2) {
    pairs.push(cardData.slice(i, i + 2));
  }
 

 

  return (
  <>
     
    
      <div >
        {pairs.map((pair, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-4">
            {pair.map((item, i) => (
              <GrayCard key={`${idx}-${i}`} title={item.title} description={item.description}/>
            ))}
          </div>
        ))}
      </div>
     
    
    <div>this is ad</div>
  </>
);
}
