export const sendEmail = ({
  otp,
  verifyURL,
}: {
  otp: string;
  verifyURL: string;
}) => {
  console.log(`
    🔶 THIS IS JUST MOCKED EMAIL: 

    🔶 OTP: ${otp}
    🔶 VerifyURL: ${verifyURL}
  `);
};
