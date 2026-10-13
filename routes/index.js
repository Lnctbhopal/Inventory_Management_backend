import express from "express";
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' , messege : "welcome to the express js" });
});

export default router;

