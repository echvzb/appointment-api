const parseGoogleDate = (d) => {
  const googleDate =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})/g;
  const [, year, month, day, hours, minutes, seconds] =
    googleDate.exec(d);
  return new Date(
    Date.UTC(+year, +month - 1, +day, +hours, +minutes, +seconds)
  );
};

module.exports = { parseGoogleDate };
