export const razorpayPayment = {
    createOrder: async (amount: number, plan: string) => {
        console.log(`Creating order for ${plan} with amount ${amount}`);
        return { id: 'order_demo_' + Math.random().toString(36).substring(7), amount };
    },
    openCheckout: async (options: any) => {
        console.log('Opening Razorpay checkout:', options);
        // Mock user interaction
        if (options.handler) {
            setTimeout(() => {
                options.handler({
                    razorpay_payment_id: 'pay_demo_' + Math.random().toString(36).substring(7),
                    razorpay_order_id: options.order_id,
                    razorpay_signature: 'demo_sig'
                });
            }, 1000);
        }
    },
    verifyPayment: async (response: any) => {
        console.log('Verifying payment:', response);
        return true;
    }
};
