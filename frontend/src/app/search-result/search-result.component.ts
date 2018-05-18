import { ProductService } from './../Services/product.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent implements OnInit, AfterViewInit {

  public displayedColumns = ['Image', 'Product', 'Description', 'Price', 'Select'];
  public tableData: any[];
  public dataSource;
  public productSubscription: Subscription;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private productService: ProductService) { }

  ngOnInit() {
  }

  ngAfterViewInit () {
    this.productSubscription = this.productService.search('').subscribe((tableData: any) => {
      this.tableData = tableData;
      this.dataSource = new MatTableDataSource<Element>(this.tableData);
      this.dataSource.paginator = this.paginator;
   });

  }

}
