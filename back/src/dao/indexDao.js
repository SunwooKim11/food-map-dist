const { pool } = require("../../config/database");

exports.isValidStudentIdxDao = async function (connection, studentIdx) {
  const Query = `SELECT * FROM Students WHERE studentIdx=? and status = "A";`;
  const Params = [studentIdx];
  const [rows] = await connection.query(Query, Params);
  // console.log(rows);
  // console.log(Object.values(rows));

  if (rows < 1) return false;
  return true;
};



exports.readStudentsDao = async function (connection, category) {
  const selectAllRestaurantsQuery = `select title, address, url, category from Restaurants where status = "A";`;
  const selectRestaurantsByCategoryQuery = `select title, address, url, category from Restaurants where status = "A" and category = ?;`;
  const Params = [category];
  console.log (Params);
  let Query = category ? selectRestaurantsByCategoryQuery : selectAllRestaurantsQuery;
  console.log(Query);
  const rows = await connection.query(Query, Params);
  return rows;
};
