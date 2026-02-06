/**
 * WhatsApp Messaging Utility
 * "Plug and Play" approach for sending messages.
 * Currently uses direct wa.me links for simple integration.
 */

export interface WhatsAppMessage {
    phone: string;
    message: string;
}

export const sendWhatsAppMessage = ({ phone, message }: WhatsAppMessage) => {
    // Clear phone number from extra characters
    const cleanPhone = phone.replace(/\D/g, '');

    // If it's an Indian number and doesn't have country code, add it
    const formattedPhone = (cleanPhone.length === 10) ? `91${cleanPhone}` : cleanPhone;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
};

/**
 * Example Template for Milk Collection
 */
export const getMilkCollectionTemplate = (data: {
    farmerName: string;
    date: string;
    session: string;
    quantity: number;
    fat: number;
    rate: number;
    amount: number;
    isHindi: boolean;
}) => {
    if (data.isHindi) {
        return `नमस्ते ${data.farmerName},\n\n` +
            `दिनांक: ${data.date} (${data.session})\n` +
            `मात्रा: ${data.quantity} L\n` +
            `फैट: ${data.fat}%\n` +
            `दर: ₹${data.rate}/L\n` +
            `कुल राशि: ₹${data.amount}\n\n` +
            `डिजीदूध के साथ जुड़ने के लिए धन्यवाद! 🥛`;
    }

    return `Hello ${data.farmerName},\n\n` +
        `Date: ${data.date} (${data.session})\n` +
        `Quantity: ${data.quantity} L\n` +
        `FAT: ${data.fat}%\n` +
        `Rate: ₹${data.rate}/L\n` +
        `Total Amount: ₹${data.amount}\n\n` +
        `Thank you for using DigiDhoodh! 🥛`;
};

/**
 * Example Template for Bill
 */
export const getBillTemplate = (data: {
    farmerName: string;
    billNumber: string;
    startDate: string;
    endDate: string;
    amount: number;
    isHindi: boolean;
}) => {
    if (data.isHindi) {
        return `नमस्ते ${data.farmerName},\n\n` +
            `आपका बिल जनरेट हो गया है।\n` +
            `बिल नंबर: ${data.billNumber}\n` +
            `अवधि: ${data.startDate} से ${data.endDate}\n` +
            `कुल राशि: ₹${data.amount}\n\n` +
            `डिजीदूध - आपका डिजिटल दूध सहायक। 🥛`;
    }

    return `Hello ${data.farmerName},\n\n` +
        `Your bill has been generated.\n` +
        `Bill #: ${data.billNumber}\n` +
        `Period: ${data.startDate} to ${data.endDate}\n` +
        `Total Amount: ₹${data.amount}\n\n` +
        `DigiDhoodh - Your Digital Milk Assistant. 🥛`;
};
