import React, { useState } from "react";
type PackageCardProps = {
  image: string;
  title: string;
  price: string;
  description: string;
  date: string;
  label: string;
  isBeli: boolean;
  onClick?: () => void;
};

const PackageCard: React.FC<PackageCardProps> = ({
  image,
  title,
  price,
  description,
  date,
  label,
  isBeli,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="border border-[#5E5E5E] rounded-lg p-4 flex flex-col w-full shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-start gap-4 flex-wrap">
        <img
          src={image}
          alt="TOEFL Preparation"
          className="w-[300px] h-auto object-cover rounded-md"
        />
        <div className="flex-1">
          <h3 className="text-[#066993] font-semibold text-lg">{title}</h3>
          <p className="text-md text-gray-800 mt-1">{price}</p>
          <p className="text-md text-gray-500">{description}</p>
          <p className="text-md font-semibold mt-2">{date}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="inline-block bg-[#FF9C9CB2] text-white  py-2 px-5 rounded text-xs font-medium">
          {label}
        </span>
      </div>
    </div>
  );
};

export default PackageCard;
