import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as Fa from 'react-icons/fa';
import { ICON_CATEGORIES } from '../pages/Editor/iconLibrary';

// Category names must match your dropdown exactly
const NAMES = {
  Birthday: ['FaBirthdayCake','FaGift','FaGifts','FaGlassCheers','FaCandyCane','FaMusic','FaStar','FaCrown','FaGrinStars','FaCameraRetro','FaCookieBite','FaIceCream'],
  Wedding: ['FaRing','FaHeart','FaGlassCheers','FaDove','FaChurch','FaCrown','FaGem','FaMusic','FaBell','FaCameraRetro','FaEnvelope','FaWineGlassAlt'],
  Baby: ['FaBaby','FaBabyCarriage','FaChild','FaHeart','FaStar','FaMoon','FaCloudSun','FaGift','FaSmile','FaFeatherAlt','FaCookieBite','FaSun'],
  Flowers: ['FaSpa','FaSeedling','FaLeaf','FaTree','FaSun','FaDove','FaFeatherAlt','FaHeart','FaCloudSun','FaAppleAlt','FaLemon','FaCarrot'],
  Religious: ['FaOm','FaPrayingHands','FaDharmachakra','FaKhanda','FaStarAndCrescent','FaCross','FaChurch','FaMosque','FaSynagogue','FaBookOpen','FaBell','FaFire'],
  Party: ['FaGlassCheers','FaMusic','FaGuitar','FaDrum','FaMicrophone','FaCocktail','FaMagic','FaGrinStars','FaStar','FaCompactDisc','FaMask','FaCameraRetro'],
  Festival: ['FaFire','FaSun','FaMoon','FaStar','FaGifts','FaDrum','FaMusic','FaMagic','FaBell','FaHome','FaSpa','FaCandyCane'],
  Food: ['FaUtensils','FaPizzaSlice','FaHamburger','FaCoffee','FaCookieBite','FaIceCream','FaWineGlass','FaCocktail','FaBreadSlice','FaCheese','FaPepperHot','FaAppleAlt'],
  Balloons: ['FaGrinStars','FaStar','FaHeart','FaGift','FaGifts','FaSmile','FaMagic','FaCrown','FaSun','FaCloudSun','FaMusic','FaGlassCheers'],
  Cake: ['FaBirthdayCake','FaCookieBite','FaIceCream','FaCandyCane','FaGift','FaStar','FaHeart','FaCoffee','FaGlassCheers','FaCrown','FaFire','FaSmile'],
  Candles: ['FaFire','FaStar','FaMoon','FaSun','FaHeart','FaPrayingHands','FaBell','FaGift','FaCrown','FaSpa','FaDove','FaOm'],
};

// Convert a react-icons component into a plain SVG string
const toSvg = (Comp) =>
  renderToStaticMarkup(React.createElement(Comp, { size: 128, color: '#000000' }))
    .replace(/currentColor/g, '#000000');

const FA_LIBRARY = Object.fromEntries(
  Object.entries(NAMES).map(([category, names]) => [
    category,
    [...new Set(names)]
      .filter((n) => Fa[n])                       // skips any name that doesn't exist
      .map((n) => ({ id: n, label: n.replace(/^Fa/, ''), svg: toSvg(Fa[n]) })),
  ])
);

// Your hand-drawn icons (diya, lotus, etc.) come first in each category
const CUSTOM = Object.fromEntries(ICON_CATEGORIES.map((c) => [c.name, c.icons]));

export const ICON_LIBRARY = Object.fromEntries(
  Object.keys(FA_LIBRARY).map((name) => [
    name,
    [...(CUSTOM[name] || []), ...FA_LIBRARY[name]],
  ])
);