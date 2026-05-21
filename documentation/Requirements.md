1. Three level of access control (Parent, Manager, Troop leader): 
    a. Leader and Manager have the same access right
    b. Parent has less access

2. Submit orders: types of cookies, quantities sold, buyers
    a. Manually
    b. Upload document: Pass through OCR to create the order
        Linked with troop and document

3. Manager Fetch information: 
    a. Cookie sales
    b. Rewards for each trooper
    c. Historical data
    d. View data by month/week/day/etc
    e. Update information for: inventory, reward, trooper data

4. Parent Select Rewards for Trooper:
    a. Only available when sales threshold has been met 

5. Manager input Rewards and Cookies
    a. CRUD for Rewards: quantity, types
    b. CRUD for Cookies: quantity, types

6. Preemtive ordering suggestions
    a. Fetch img and data of 3 most sold cookies each month, based on amount sold
    b. Update frontend

//////////NEW REQUIREMENT//////////

7. (service) Form: Financial aggreement, rules

8. (service) Membership voucher opt: boolean

9. (ommit) Shirt and jacket size selection 

11. (orderService)Submit orders via https://docs.google.com/forms/d/e/1FAIpQLScf0nElJbi9kRmq9S_AEBpZeVQDKuuMmUmZ2QiEJcnbY7FubA/viewform

12. (notification via email) Email confirmation to parents after they ordered

13. (ommit) Order from council 

14. (util: sorting) Pull data from all orders combined in a certain range

15. (ommit for now)Booth management and recommendation: 
    Cookie cases/Booth: will create an order
    Booth cookies orders should be labled as it could be return to council

16. (orderService) Cookies picked up from council -> add to troop inventory

17. (orderService, notificationService) "Ready for pickup function" Leader notify parents when cookies orders are ready to be pick up (via a button), parent confirm the order (via a button), then send email notification

18. (saleDataService, orderService) Input sale information, total ammount in cash/credit
    Card transaction: update 'owe' from order
    Cash transaction: update when leader receive the money and update 'owe' from order (via a button), similar to cookie pick up
    
19. "If currently in stock, reduce troop inventory, notify troop cookie chair theres orders to fill with current inventory. If not in stock, set it in the to order pile. "

20. "Troop cookie chair should be able to see each girl’s balance and inventory."

21. "Parents should be able to return cookies if needed. "
    "Reduce their inventory and their balance when turned in. Update troop inventory when turned in. Confirmation process when it is turned in"

22. (ommit for now)boothService 


    




