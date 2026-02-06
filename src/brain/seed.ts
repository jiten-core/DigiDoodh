import { db } from '../shared/db';

export async function seedTestData(dairyId: string) {
    console.log('Seeding test data for dairy:', dairyId);

    // 1. Seed Farmers
    const farmers = [
        { name: 'Rajesh Kumar', code: 'F101', village: 'Ramnagar', phone: '9876543210' },
        { name: 'Sita Devi', code: 'F102', village: 'Ramnagar', phone: '9876543211' },
        { name: 'Amit Singh', code: 'F103', village: 'Gopalpur', phone: '9876543212' },
    ];

    for (const f of farmers) {
        const { data: farmer, error } = await db
            .from('farmers')
            .upsert([{ ...f, dairy_id: dairyId, active: true }], { onConflict: 'dairy_id,code' })
            .select()
            .single();

        if (error) {
            console.error('Error seeding farmer:', f.name, error.message);
            continue;
        }

        // 2. Seed some Milk Entries for the last 3 days
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            await db.from('milk_entries').insert([
                {
                    dairy_id: dairyId,
                    farmer_id: farmer.id,
                    liters: 5 + Math.random() * 5,
                    fat: 4 + Math.random(),
                    snf: 8 + Math.random(),
                    session: 'morning',
                    entry_date: dateStr,
                    is_correction: false
                },
                {
                    dairy_id: dairyId,
                    farmer_id: farmer.id,
                    liters: 4 + Math.random() * 5,
                    fat: 4 + Math.random(),
                    snf: 8 + Math.random(),
                    session: 'evening',
                    entry_date: dateStr,
                    is_correction: false
                }
            ]);
        }
    }

    // 3. Seed Products
    const products = [
        { name: 'Cattle Feed (Gold)', price: 1200, unit: 'bag', category: 'feed', stock: 50 },
        { name: 'Calcium Tonic', price: 450, unit: 'bottle', category: 'medicine', stock: 20 },
    ];

    for (const p of products) {
        await db.from('products').upsert([{ ...p, dairy_id: dairyId, active: true }], { onConflict: 'dairy_id,name' });
    }

    console.log('Test data seeded successfully!');
}
