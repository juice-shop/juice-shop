package com.juiceshop.tests;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import java.time.Duration;

public class JuiceShopLoginTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod

    public void setUP(){

        driver = new EdgeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver,Duration.ofSeconds(15));
        driver.get("https://juice-shop.herokuapp.com/#/");

    }

    @Test

    public void testSuccessfulAdminLogin(){
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[aria-label='Close Welcome Banner']"))).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.id("navbarAccount"))).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.id("navbarLoginButton"))).click();
        Assert.assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("logo"))).isDisplayed());
        Assert.assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".mat-toolbar-row.navbar-row"))).isDisplayed());
        driver.findElement(By.id("email")).sendKeys("admin@juice-sh.op");
        driver.findElement(By.id("password")).sendKeys("admin123");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("loginButton"))).click();
        Assert.assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("button[aria-label='Show the shopping cart']"))).isDisplayed(), "Login failed - Basket icon is missing!");
    }

    @AfterMethod

    public void tearDown(){
        driver.quit();
    }
}
