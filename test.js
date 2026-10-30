const express = require("express");
const app = express();

// Đọc JSON từ request và đưa vào req.body.
app.use(express.json());

// Dữ liệu giả lập
const tickets = [
  { id: 1, name: "Vé VinWonders", price: 750000, stock: 5 },
  { id: 2, name: "Vé Safari", price: 650000, stock: 3 }
];

const bookings = [];

function calculateDiscount(totalAmount) {
  if (totalAmount < 1000000) {
    return 0;
  }

  return Math.min(totalAmount * 0.1, 200000);
}

// API phụ để xem tồn kho khi thử bằng Postman.
app.get("/api/tickets", (req, res) => {
  res.json(tickets);
});

app.post("/api/bookings", (req, res) => {
  const { ticketId, quantity } = req.body || {};

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return res.status(400).json({ message: "ticketId phải là số nguyên dương" });
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "quantity phải là số nguyên dương" });
  }

  const ticket = tickets.find((item) => item.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ message: "Vé không tồn tại" });
  }

  if (quantity > ticket.stock) {
    return res.status(409).json({ message: "Không đủ vé trong kho" });
  }

  // Giá luôn lấy từ dữ liệu backend.
  const totalAmount = ticket.price * quantity;
  const discountAmount = calculateDiscount(totalAmount);
  const finalAmount = totalAmount - discountAmount;

  const booking = {
    bookingId: "BK" + String(bookings.length + 1).padStart(3, "0"),
    ticketId: ticket.id,
    quantity: quantity,
    totalAmount: totalAmount,
    discountAmount: discountAmount,
    finalAmount: finalAmount,
    status: "CONFIRMED"
  };

  ticket.stock = ticket.stock - quantity;
  bookings.push(booking);

  return res.status(201).json(booking);
});

// Middleware xử lý lỗi: Express yêu cầu đủ 4 tham số.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON không hợp lệ" });
  }

  return res.status(err.status || 500).json({ message: "Không thể xử lý yêu cầu" });
});

app.listen(3000, () => {
  console.log("Server đang chạy tại http://localhost:3000");
});



// chỉ còn 1 vé, làm sao để hai khách cùng đặt mà hệ thống chỉ bán thành công cho một người
// => dùng database chung và để database kiểm tra đủ kho đồng thời với việc trừ kho.
// UPDATE tickets
// SET stock = stock - 1
// WHERE id = 1
//   AND stock >= 1;