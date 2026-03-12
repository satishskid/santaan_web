import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthorizedOpsUser } from "@/lib/auth-helper";
import { computeNeoDoveShadowSnapshot, upsertNeoDoveCampaignMapping } from "@/lib/neodove-shadow";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    const allowed = await isAuthorizedOpsUser(session?.user?.email, (session?.user as { role?: string } | undefined)?.role);
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await computeNeoDoveShadowSnapshot(7);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Failed to fetch NeoDove shadow snapshot:", error);
    return NextResponse.json({ error: "Failed to fetch NeoDove shadow snapshot" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const allowed = await isAuthorizedOpsUser(session?.user?.email, (session?.user as { role?: string } | undefined)?.role);
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const neodoveCampaignId = String(body.neodoveCampaignId || "").trim();
    const neodoveCampaignName = String(body.neodoveCampaignName || "").trim();
    const sourceBucket = String(body.sourceBucket || "").trim();
    const center = String(body.center || "network").trim().toLowerCase();
    const utmCampaign = String(body.utmCampaign || "").trim();

    if (!neodoveCampaignId || !neodoveCampaignName || !sourceBucket || !utmCampaign) {
      return NextResponse.json(
        { error: "neodoveCampaignId, neodoveCampaignName, sourceBucket, and utmCampaign are required" },
        { status: 400 }
      );
    }

    const mapping = await upsertNeoDoveCampaignMapping({
      neodoveCampaignId,
      neodoveCampaignName,
      sourceBucket,
      center,
      utmCampaign,
      owner: body.owner ? String(body.owner).trim() : undefined,
      isActive: body.isActive !== false,
      notes: body.notes ? String(body.notes).trim() : undefined,
    });

    return NextResponse.json({ success: true, mapping });
  } catch (error) {
    console.error("Failed to upsert NeoDove mapping:", error);
    return NextResponse.json({ error: "Failed to save NeoDove mapping" }, { status: 500 });
  }
}
