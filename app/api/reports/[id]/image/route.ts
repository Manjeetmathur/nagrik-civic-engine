import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { imageUrl } = body;

        if (!imageUrl) {
            return NextResponse.json(
                { error: "Image URL is required" },
                { status: 400 }
            );
        }

        const updatedReport = await prisma.report.update({
            where: { id },
            data: { imageUrl },
        });

        return NextResponse.json(updatedReport);
    } catch (err) {
        console.error("REPORT IMAGE UPDATE ERROR:", err);
        return NextResponse.json(
            { error: "Failed to update report image" },
            { status: 500 }
        );
    }
}
