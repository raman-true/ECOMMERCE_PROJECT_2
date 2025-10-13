New Client Requirements (from conversation)

Add Pickup Option in Freight

Currently, the freight/shipping options don’t include “Pickup.”

The client wants customers to be able to choose “Pickup” instead of delivery.

Email Alert for New Orders

The client wants email notifications to be sent automatically when a new order is placed.

The alert should go to the supplier’s inbox or phone (via email).

This is because suppliers may be onsite doing installations and won’t always log in to check orders manually.

Onsite Installation Charge Feature

Some suppliers perform onsite installation services and need to charge customers additional fees for that.

The system should allow suppliers to add installation charges for specific orders or products.

💡 Summary of What You’ll Need to Implement
Feature	Description	Possible Implementation
Pickup Option	Add “Pickup” as a freight/shipping method.	Update shipping options table or enum; add “Pickup” option in checkout UI and backend logic.
Email Notification	Notify supplier when a customer places an order.	Integrate an email server (e.g., SendGrid, Nodemailer, or SMTP); trigger email on order creation.
Installation Charges	Allow suppliers to add onsite installation charges.	Add a field for installation fee in order or product model; show option during checkout or in supplier dashboard.