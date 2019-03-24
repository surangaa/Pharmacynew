using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyPharmacy.Core.Model
{
    class Suppliers
    {
       
        [Key, ForeignKey("Orders")]
        [Column("SupplierID")]
        public int SupplierId { get; set; }

        [Column("SupplierAddress")]
        public string SupplierAddress { get; set; }

        [Column("Suppliername")]
        public string Suppliername { get; set; }



    }
}
