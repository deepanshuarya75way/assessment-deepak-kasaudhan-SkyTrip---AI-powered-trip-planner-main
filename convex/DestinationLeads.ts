import {v} from "convex/values";
import { mutation, query } from "./_generated/server";
export const saveLead = mutation ({args: {
  destination: v.string(),
  email: v.string(),
  criteria: v.any(),
},
handler: async (ctx, a ) => {
   const old = await Ctx.db 
   .query("DestinationLeads")
   .withIndex("by_destination", q =>
    q.eq("destinationName", a.destination)
   )
   .filter(q=>  q.eq(
    q.field("useremail"),
    a.email))
    .first();
   
    
  if (old) return old._id;
  return await 
  Ctx.db.insert("DestinationLeads",
    {
            destinationName: a.destination,
            userEmail: .email,
            searchCriteria: a.criteria,
            status: "Waiting",
            notified: false,
            retryCount: 0,
            createdAt: Date.now(),
    });
  },
});

export const getLeads = query({ args: {},
  handler: ctx=>
ctx.db.query("DestinationLeads").collect(),    

}); 
export const markAvailable=
mutation({ args: { id:
  v.id("DestinationLeads") },
  handler: async (ctx , {id}) =>
  {
    const lead = await 
  ctx.db.get(id);
  if (!lead|| lead.notified)
    return false;
  
     await ctx.db.patch(id,
      {status: "available"});
      return true;
     },
    });
