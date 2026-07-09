import { GET } from './app/api/ration/config/route';
async function main() {
    const res = await GET();
    const data = await res.json();
    console.log("Ration Config Batch 2:");
    console.log(data.rationConfig['batch_2'].map((a: any) => a.id));
}
main().catch(console.error);
