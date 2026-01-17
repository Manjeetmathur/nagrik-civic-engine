const fetch = require('node-fetch'); // Assuming node-fetch or native fetch in node 18+

async function test() {
    try {
        // 1. Create Alert
        console.log("Creating alert...");
        const createRes = await fetch('http://localhost:3000/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'Pothole',
                location: 'Test Loc',
                description: 'Test Desc',
                imageUrl: 'abc',
                reporter: { name: 'Tester' }
            })
        });
        
        if (!createRes.ok) {
            console.error("Create failed:", await createRes.text());
            return;
        }
        
        const alert = await createRes.json();
        console.log("Created Alert ID:", alert.id);

        // 2. Update Status
        console.log("Updating status to Resolved...");
        const updateRes = await fetch(`http://localhost:3000/api/alerts/${alert.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Resolved' }) // Using 'Resolved' as per Enum
        });

        if (!updateRes.ok) {
            console.error("Update failed:", updateRes.status, await updateRes.text());
        } else {
            console.log("Update success:", await updateRes.json());
        }

    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
