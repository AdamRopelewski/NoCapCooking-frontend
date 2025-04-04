import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { recipeDto } from '../../models/recipe-dto';
import { SingleRecipeComponent } from "../single-recipe/single-recipe.component";
import { CommonModule } from '@angular/common';
import { RecipeService, CuisineTag, DietTag } from '../../services/recipe.service';
import { page } from '../../models/page';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { map, Observable, debounceTime, distinctUntilChanged, switchMap, filter, BehaviorSubject } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { SideNavComponent } from '../side-nav/side-nav.component';
import { Filter } from '../../models/filter';
import { Tag } from '../../models/tag';
import { Input } from 'postcss';



@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-browse-page',
  standalone: true,
  imports: [
    SingleRecipeComponent,
    CommonModule,
    MatPaginatorModule,
    MatChipsModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIconModule,
    SideNavComponent
  ],
  templateUrl: './browse-page.component.html',
  styleUrls: ['./browse-page.component.css']
})
export class BrowsePageComponent implements OnInit {

  

  filters: Filter = {
    ingredient: [],
    cuisine: [],
    diet: []
  };
  $filter = new BehaviorSubject<Filter>(this.filters);
  // Ingredients
  ingredientCtrl = new FormControl('');
  filteredIngredients!: Observable<string[]>;
  selectedIngredients: string[] = [];

  // Cuisines
  cuisineCtrl = new FormControl('');
  filteredCuisines!: Observable<string[]>;
  selectedCuisines: string[] = [];

  // Diets
  dietCtrl = new FormControl('');
  filteredDiets!: Observable<string[]>;
  selectedDiets: string[] = [];

  // Recipes related
  recipes: recipeDto[] = [];
  length = 500;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10];
  showFirstLastButtons = true;


  constructor(private recipeService: RecipeService, private cuisineTag: CuisineTag, private dietTag: DietTag) { }

  ngOnInit() {

    this.getRecipes();
    
  }



  handlePageEvent(event: PageEvent) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    if(this.filters.ingredient.length > 0 || this.filters.cuisine.length > 0 || this.filters.diet.length > 0) {
      this.getFilteredRecipes();
    }
    else {
      this.getRecipes();
    }
  }

  // Getting recipes form ap



  getRecipes() {
    this.recipeService.getRecipes(this.pageIndex + 1, this.pageSize).subscribe({
      next: (page: page<recipeDto>) => {
        this.recipes = page.results;
      },
      error: (err) => {
        console.error('Error loading recipes:', err);
      }
    });
  }
  saveFilters(filters: Filter) {
    this.filters = filters;
    this.pageSize = 10;
    this.pageIndex = 0;
    if(this.filters.ingredient.length > 0 || this.filters.cuisine.length > 0 || this.filters.diet.length > 0) {
      this.getFilteredRecipes();
    }
    else {
      this.getRecipes();
    }
  }

  getFilteredRecipes() {
    this.recipeService.getFilteredRecipes(this.filters, this.pageIndex+1, this.pageSize).subscribe({
      next: (page: page<recipeDto>) => {
        this.recipes = page.results;
      },
      error: (err) => {
        console.error('Error loading filtered recipes:', err);
      }
    });
  }

  addTag(event: Tag) {
    if (event.type === 'ingredient' && !this.filters.ingredient.includes(event.name)) {
      this.filters.ingredient.push(event.name);
    } else if (event.type === 'cuisine' && !this.filters.cuisine.includes(event.name)) {
      this.filters.cuisine.push(event.name);

    } else if (event.type === 'diet' && !this.filters.diet.includes(event.name)) {
      this.filters.diet.push(event.name);
    }
    this.$filter.next(this.filters);
  }
}
