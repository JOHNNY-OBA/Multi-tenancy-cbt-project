export const generateStudentRegNo = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return "STU-" + timestamp + random;
};

export const generateStaffId = () => {
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return "TCH-" + timestamp + random;
};
