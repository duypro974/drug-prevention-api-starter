const CourseRegistration = require("../models/courseRegistration.model");
require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Tạo Stripe checkout session (gọi khi user bấm Thanh toán)
 */
exports.createCheckoutSession = async (req, res) => {
  const { courseId, courseTitle, amount } = req.body;
  const userId = req.user.id;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: courseTitle },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { userId, courseId },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo session thanh toán" });
  }
};

/**
 * Stripe webhook – xác nhận thanh toán thành công
 */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, courseId } = session.metadata;
    await CourseRegistration.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        paid: true,
        paidAt: new Date(),
        paymentMethod: "stripe",
        paymentInfo: session
      }
    );
  }

  res.json({ received: true });
};

/**
 * API: FE dùng lấy courseId từ session_id Stripe (gọi ở payment-success)
 */
exports.getSessionInfo = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ message: "Thiếu session_id" });
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session.metadata || !session.metadata.courseId) {
      return res.status(404).json({ message: "Không tìm thấy courseId" });
    }
    // Kiểm tra quyền user (nếu muốn)
    if (req.user && session.metadata.userId && req.user.id !== session.metadata.userId) {
      return res.status(403).json({ message: "Bạn không có quyền xem session này" });
    }
    res.json({ courseId: session.metadata.courseId });
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy thông tin session Stripe" });
  }
};
