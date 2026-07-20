import { responsiveClass } from "./responsive";

export const tw = {

  screen: responsiveClass(
    "px-4 py-4 gap-4",
    "px-5 py-5 gap-5",
    "px-6 py-6 gap-6",
    "px-7 py-7 gap-7"
  ),

  input: responsiveClass(
    "h-11",
    "h-12",
    "h-13",
    "h-14"
  ),

  button: responsiveClass(
    "h-11",
    "h-12",
    "h-13",
    "h-14"
  ),

  title: responsiveClass(
    "text-2xl",
    "text-3xl",
    "text-3xl",
    "text-4xl"
  ),

  subtitle: responsiveClass(
    "text-sm",
    "text-base",
    "text-base",
    "text-lg"
  ),

  body: responsiveClass(
    "text-sm",
    "text-base",
    "text-base",
    "text-lg"
  ),

  card: responsiveClass(
    "p-4",
    "p-5",
    "p-6",
    "p-7"
  ),
  inputContainer: responsiveClass(
    "rounded-xl px-4",
    "rounded-xl px-4",
    "rounded-xl px-4",
    "rounded-xl px-5"
  ),

  sectionGap: responsiveClass(
    "gap-4",
    "gap-5",
    "gap-5",
    "gap-6"
  ),

  footer: responsiveClass(
    "pb-4",
    "pb-5",
    "pb-6",
    "pb-6"
  ),

  icon: responsiveClass(
    "h-5 w-5",
    "h-6 w-6",
    "h-6 w-6",
    "h-7 w-7"
  ),

};