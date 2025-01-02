'use client';

import { NextPage } from 'next';
import { ButtonHTMLAttributes } from 'react';
import {
  CalendarDay,
  DayPicker,
  getDefaultClassNames,
  Modifiers,
  useDayPicker,
} from 'react-day-picker';
import { ko } from 'react-day-picker/locale';

import 'react-day-picker/style.css';

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const defaultClassNames = getDefaultClassNames();

  return (
    <div className="">
      <DayPicker
        captionLayout="dropdown"
        mode="single"
        showOutsideDays
        locale={ko}
        classNames={{
          month_grid: `${defaultClassNames.month_grid} w-full`,
          month: `${defaultClassNames.month} w-full`,
          months: `${defaultClassNames.months} !max-w-none`,
          day: `${defaultClassNames.day} !text-lg !font-bold`,
          outside: `${defaultClassNames.outside} !text-lg !text-gray-400`,
          day_button: `${defaultClassNames.day_button} !inline-flex !relative !mx-auto !border-none`,
          weekday: `${defaultClassNames.weekday} !font-bold !text-lg`,
          month_caption: `${defaultClassNames.month_caption} justify-center !text-xl`,
          nav: `${defaultClassNames.nav} w-full gap-48 justify-center`,
        }}
        components={{
          DayButton: (props) => <CustomNode {...props} />,
        }}
      />
    </div>
  );
};

type CustomNodeProps = {
  day: CalendarDay;
  modifiers: Modifiers;
} & ButtonHTMLAttributes<HTMLButtonElement>;
const CustomNode: React.FC<CustomNodeProps> = ({
  day,
  className,
  modifiers: _,
  ...props
}) => {
  // const dic = { '2025-00-02': true };
  const { isSelected } = useDayPicker();
  const formatted = day.dateLib.format(day.date, 'yyyy-MM-dd');
  console.log('formatted: ', formatted);

  return (
    <button
      className={
        className + ' ' + (isSelected!(day.date) && '!bg-blue-600 !text-white')
      }
      {...props}
    >
      {props.children}
      {/* {formatted} */}
      {formatted === '2025-01-10' && (
        <div
          className={`absolute bottom-1 w-2 h-2 rounded-full bg-purple-600 ${isSelected!(day.date) && '!bg-white'}`}
        />
      )}
    </button>
  );
};

export default Page;
