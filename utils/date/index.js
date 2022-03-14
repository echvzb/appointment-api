const parseGoogleDate = (d) => {
  const googleDate =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})/g;
  const [, year, month, day, hours, minutes, seconds, tzHour, tzMinute] =
    googleDate.exec(d);
  const tzOffset = +tzHour * 60 + +tzMinute;
  return new Date(
    Date.UTC(+year, +month - 1, +day, +hours, +minutes - tzOffset, +seconds)
  );
};

module.exports = { parseGoogleDate };
