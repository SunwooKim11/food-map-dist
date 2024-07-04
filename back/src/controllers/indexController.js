const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const jwt = require("jsonwebtoken");
const secret = require("../../config/secret");

const indexDao = require("../dao/indexDao");

exports.readRestaurants = async function (req, res) {
  const { category } = req.query;
  console.log(category);

  if (category) {
    categoryList = [
      "한식",
      "중식",
      "일식",
      "양식",
      "분식",
      "구이",
      "회/초밥",
      "기타",
    ];
    if (!categoryList.includes(category)) {
      return res.send({
        isSuccess: false,
        code: 400, // 요청 실패시 400번대 코드
        message: "유효하지 않은 카테고리",
      });
    }
  }

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [rows] = await indexDao.readStudentsDao(connection, category);

      return res.send({
        result: rows,
        isSuccess: true,
        code: 200,
        message: "식당 조회 성공",
      });
    } catch (err) {
      logger.error(`readRestaurants Query error\n: ${JSON.stringify(err)}`);
      return false;
    } finally {
      connection.release();
    }
  } catch (err) {
    logger.error(`Students DB Connection error\n: ${JSON.stringify(err)}`);
    return false;
  }
};
