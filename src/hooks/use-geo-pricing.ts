"use client";

import { useMemo } from "react";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function useGeoPricing() {
  return useMemo(() => {
    const country = getCookie("geo-country");
    const isBR = country === "BR";
    return {
      country,
      isBR,
      currency: isBR ? "R$" : "€",
      monthlyPrice: isBR ? 25 : 9,
      yearlyTotal: isBR ? 219 : 84,
      monthlyDisplay: isBR ? "R$25" : "€9",
      yearlyPerMonth: isBR ? "R$18" : "€7",
      yearlyDisplay: isBR ? "R$219/ano" : "€84/yr",
    };
  }, []);
}
