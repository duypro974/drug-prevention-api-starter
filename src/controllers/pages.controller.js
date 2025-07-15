exports.getAbout = (req, res) => {
  res.json({
    title: "Giới thiệu tổ chức",
    description: "Tổ chức ABC là đơn vị tiên phong trong việc hỗ trợ cộng đồng phòng chống ma túy..."
  });
};
