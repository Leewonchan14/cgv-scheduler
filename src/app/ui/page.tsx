'use client';

import { NextPage } from 'next';
import React, { useState } from 'react';
import Select, { SingleValue } from 'react-select';

interface Props {} 

type ColorOption = {
  value: string;
  label: string;
  color: string;
};

const colourOptions = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9' },
  { value: 'blue', label: 'Blue', color: '#0052CC' },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630' },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];

type FlavourOption = {
  value: string;
  label: string;
  rating: string;
};

type GroupOption = {
  label: string;
  options: FlavourOption[] | ColorOption[];
};
const flavourOptions = [
  { value: 'vanilla', label: 'Vanilla', rating: 'safe' },
  { value: 'chocolate', label: 'Chocolate', rating: 'good' },
  { value: 'strawberry', label: 'Strawberry', rating: 'wild' },
];

const groupedOptions = [
  {
    label: 'Colours',
    options: colourOptions,
  },
  {
    label: 'Flavours',
    options: flavourOptions,
  },
];

const Page: NextPage<Props> = ({}) => {
  const [selectOption, setSelectOption] = useState<FlavourOption | ColorOption>(
    flavourOptions[0],
  );
  const handleChange = (
    selectedOption: SingleValue<ColorOption | FlavourOption>,
  ) => {
    setSelectOption(selectedOption!);
  };

  const formatGroupLabel = (data: GroupOption) => (
    <div>
      <span>{data.label}</span>
      <span>{data.options.length}</span>
    </div>
  );

  return (
    <React.Fragment>
      <Select<ColorOption | FlavourOption, false, GroupOption>
        id="grouped-select"
        value={selectOption}
        onChange={handleChange}
        options={groupedOptions}
        formatGroupLabel={formatGroupLabel}
      />
    </React.Fragment>
  );
};

export default Page;
