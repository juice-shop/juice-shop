import { ProductDetailsComponent } from './../product-details/product-details.component';
import { Router } from '@angular/router';
import { ProductService } from './../Services/product.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import fontawesome from '@fortawesome/fontawesome';
import { faEye, faCartPlus } from '@fortawesome/fontawesome-free-solid';
fontawesome.library.add(faEye, faCartPlus);

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, AfterViewInit {

  public displayedColumns = ['Image', 'Product', 'Description', 'Price', 'Select'];
  public tableData: any[];
  public dataSource;
  public searchValue: string;
  private productSubscription: Subscription;
  private routerSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private dialog: MatDialog, private productService: ProductService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
  }

  ngAfterViewInit () {
    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData;
      this.dataSource = new MatTableDataSource<Element>(this.tableData);
      this.dataSource.paginator = this.paginator;
      this.filterTable();
      this.routerSubscription = this.router.events.subscribe(() => {
      this.filterTable();
      });
   });
  }

  filterTable () {
    let queryParam: string = this.route.snapshot.queryParams.q;
    if (queryParam) {
      this.searchValue = 'Search for -' + queryParam;
      queryParam = queryParam.trim();
      queryParam = queryParam.toLowerCase();
      this.dataSource.filter = queryParam;
      } else {
      this.searchValue = 'All Products';
      this.dataSource.filter = '';
      }
  }

  showDetail (element: any) {
    const dialogRef = this.dialog.open(ProductDetailsComponent, {
      width: '1000px',
      height: 'max-content',
      data: {
       productData: element
     }
    });
  }

  isLoggedIn () {
    return localStorage.getItem('token');
  }

}
