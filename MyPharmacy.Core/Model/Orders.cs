using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyPharmacy.Core.Model
{
    class Orders
    {
        [Key, ForeignKey("Transactions")]
        [Column("OrderID")]
        public int OrderId { get; set; }

        [Column("OrderDate")]
        public DateTime OrderDate { get; set; }

        [Column("Order_Amount")]
        public Double Amount { get; set; }

        [Column("Order_Description")]
        public String OrderDescription { get; set; }

        [Column("SupplierID")]
        [ForeignKey("SupplierID")]
        public int? SupplierID { get; set; }




    }
}
