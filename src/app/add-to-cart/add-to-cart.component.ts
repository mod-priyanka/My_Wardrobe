import { Component, OnInit } from '@angular/core';
import { UserDataService } from 'src/user-data.service';
import { Product } from 'src/datatype.model';
import { Router } from '@angular/router';
import { Subscription} from 'rxjs';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.css']
})
export class AddToCartComponent implements OnInit {
  noProductValues: boolean = false
  actualProduct: Product[]
  productList: Product[] 
  filter:boolean
  totalAmount: number
  buyer_quantity: number
  productSelected:Product[]
  displayedColumns: string[] = ['Image', 'Name', 'Price', 'Quantity', 'Action'];
  subscription: Subscription;
  user:string
  constructor(private userService: UserDataService,
              private router: Router) { }
  navigationArray: Array<{ label: string, link?: string }> = [
    {
      label: 'Home',
      link: '/home',
    },
    {
      label: 'Cart'
    }];
  ngOnInit(): void {
    this.userService.getProductDetails().subscribe((actualProduct) => {
      this.actualProduct = actualProduct
      
    })
    this.userService.getSelectedProductList().subscribe((productDetail) => {
      this.productSelected = productDetail
      const productLength = Object.keys(productDetail).length
      if (productLength) {
        this.noProductValues = true
      }
      else {
        this.noProductValues = false
      }
      
      this.productList = productDetail;
      
      let totalAmt = 0;
      for (let amt of productDetail) {
        totalAmt += (amt.product_price * amt.product_quantity)
      }
      this.totalAmount = totalAmt;
    });
  }
  
  search(data:string){


    if(data){
      // for(let p of this.productList) {
      //   if(p.product_name.toLowerCase().includes(data.toLocaleLowerCase())) {
      //     a.push(p);
      //   }
      // }

      // this.productList = a;

      this.productList = this.productSelected.filter((product:Product) => {
         return product.product_name.toLowerCase().includes(data.toLowerCase());
      })

    }
    else{
      this.productList = this.productSelected 
    }
  }

  removeProduct(productId: number) {
    this.userService.deleteSelectedProduct(productId).subscribe((productId) => {
      this.userService.getSelectedProductList().subscribe((productUpdated) => {
        const productLength = Object.keys(productUpdated).length
        if (productLength) {
          this.noProductValues = true
        }
        else {
          this.noProductValues = false
        }

        this.productList = (productUpdated)
        let totalAmt = 0;
        for (let amt of productUpdated) {
          totalAmt += (amt.product_price * amt.product_quantity)
        }
        this.totalAmount = totalAmt;
      })
    })
  }

  minusCounter(element: Product) {
    for (let actual of this.actualProduct) {

      if (actual.id === element.id) {

        if (element.product_quantity > 1) {
          element.product_quantity = element.product_quantity - 1
          this.userService.updateSelectedQuantity(element.id, element).subscribe((upadated) => {

            let totalAmt = 0;
            for (let amt of this.productList) {

              totalAmt += (amt.product_price * amt.product_quantity)

            }
            this.totalAmount = totalAmt;
          })
        }
        else {
          Swal.fire("Do you want to remove product then click on delete button!");
        }
      }
    }
  }

  plusCounter(element: Product) {
    for (let actual of this.actualProduct) {

      if (actual.id === element.id) {
        if (actual.product_quantity > element.product_quantity) {
          element.product_quantity = element.product_quantity + 1

          this.userService.updateSelectedQuantity(element.id, element).subscribe((upadated) => {

            let totalAmt = 0;
            for (let amt of this.productList) {

              totalAmt += (amt.product_price * amt.product_quantity)
          
            }
            this.totalAmount = totalAmt;
          })
        }
        else {
          Swal.fire("Don't have more stock!");
        }

      }
    }

  }

  buyNow() {
    this.user = JSON.parse(localStorage.getItem('User') as string);
    if(this.user){
      this.userService.getSelectedProductList().subscribe((productSelected)=>{
        this.productSelected = productSelected
        this.userService.getProductDetails().subscribe((actualData)=>{
          this.actualProduct = actualData
  
          for(let selected of this.productSelected) {
            for(let actual of this.actualProduct) {
              if(selected.id === actual.id) {
                actual.product_quantity = actual.product_quantity -  selected.product_quantity;
                  this.subscription  = this.userService.updateProduct(actual.id,actual).subscribe((res)=>{
                    this.subscription.unsubscribe();
                  })
                  this.subscription = this.userService.deleteSelectedProduct(selected.id).subscribe(res=>{
                    this.subscription.unsubscribe();
                  })
              }
            }
          }
        })
      })
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Your order placed successfully",
        showConfirmButton: false,
        timer: 2000
      });
      this.router.navigate(['/home'])
    }
    else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Need to Log in to buy!!!',
      }).then(()=>{
        this.router.navigate(['/customer-login']);
      })

    }
  }
}