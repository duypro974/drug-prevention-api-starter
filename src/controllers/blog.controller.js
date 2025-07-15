const Blog = require("../models/blog.model");

// Lấy tất cả bài viết đã được publish, có thể lọc theo author
exports.getAllBlogs = async (req, res) => {
  const filter = { published: true };

  if (req.query.author) {
    filter.author = req.query.author;
  }

  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .populate("author", "name email"); // nếu muốn hiển thị thông tin người viết

  res.json(blogs);
};


// Lấy bài viết theo ID
exports.getBlogById = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Không tìm thấy bài viết" });
  res.json(blog);
};

// Tạo bài viết mới
exports.createBlog = async (req, res) => {
  const newBlog = new Blog(req.body);
  await newBlog.save();
  res.status(201).json(newBlog);
};

// Cập nhật bài viết
exports.updateBlog = async (req, res) => {
  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error: error.message });
  }
};

// Xoá bài viết
exports.deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json({ message: "Đã xoá bài viết thành công" });
  } catch (error) {
    res.status(400).json({ message: "Xoá thất bại", error: error.message });
  }
};
