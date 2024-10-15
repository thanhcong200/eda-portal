const reader = require("xlsx");

const readDataFromWinnovateFile = async () => {
  const file = reader.readFile("src/seeder/data/241015_WINNOVATE.xlsx");
  let data = [];
  const sheets = file.SheetNames;
  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
    temp.forEach((res) => {
      data.push(res);
    });
  }

  console.log(data);
};

readDataFromWinnovateFile();
